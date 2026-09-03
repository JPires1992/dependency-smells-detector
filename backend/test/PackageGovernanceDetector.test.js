import test from "node:test";
import assert from "node:assert/strict";
import { DomainRegistrationVerifier } from "../src/detectors/package-governance/DomainRegistrationVerifier.js";
import { GovernanceThresholdPolicy } from "../src/detectors/package-governance/GovernanceThresholdPolicy.js";
import { MaintainerDomainParser } from "../src/detectors/package-governance/MaintainerDomainParser.js";
import { PackageGovernanceDetector } from "../src/detectors/package-governance/PackageGovernanceDetector.js";
import { RdapDomainStatusProvider } from "../src/detectors/package-governance/RdapDomainStatusProvider.js";
import {
  InstallScriptExecutionRule,
  TooManyContributorsRule,
  TooManyMaintainersRule
} from "../src/detectors/package-governance/PackageGovernanceRules.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";
import { NpmRegistryClient } from "../src/registry/npm/NpmRegistryClient.js";

/** Creates unique npm person records for deterministic threshold tests. */
function createPeople(count, prefix, domain = "example.com") {
  return Array.from({ length: count }, (_, index) => ({
    name: `${prefix}-${index + 1}`,
    email: `${prefix}-${index + 1}@${domain}`
  }));
}

/** Builds the common rule context for one installed package. */
function createRuleContext({ maintainerCount, contributorCount }) {
  return {
    node: { id: "sample@1.0.0", name: "sample", version: "1.0.0" },
    manifest: { name: "sample", version: "2.0.0" },
    maintainers: createPeople(maintainerCount, "maintainer"),
    contributors: createPeople(contributorCount, "contributor"),
    contributorsDeclared: true
  };
}

/** Verifies public-suffix-aware extraction from maintainer email subdomains. */
test("MaintainerDomainParser returns the registrable email domain", () => {
  const parser = new MaintainerDomainParser();

  assert.equal(parser.parse("Person <ignored>"), null);
  assert.equal(parser.parse("user@mail.project.example.co.uk"), "example.co.uk");
});

/** Verifies that independent DNS and RDAP absence is required for confirmation. */
test("DomainRegistrationVerifier confirms only matching unregistered evidence", async () => {
  const unregisteredVerifier = new DomainRegistrationVerifier({
    dnsProvider: { async check() { return { status: "unregistered", reason: "NXDOMAIN" }; } },
    rdapProvider: { async check() { return { status: "unregistered", reason: "HTTP 404" }; } }
  });
  const conflictingVerifier = new DomainRegistrationVerifier({
    dnsProvider: { async check() { return { status: "unregistered", reason: "NXDOMAIN" }; } },
    rdapProvider: { async check() { return { status: "registered", reason: null }; } }
  });

  assert.equal((await unregisteredVerifier.verify("expired.example")).status, "unregistered");
  assert.equal((await conflictingVerifier.verify("active.example")).status, "registered");
});

/** Verifies authoritative RDAP service discovery and unregistered-domain handling. */
test("RdapDomainStatusProvider uses the IANA bootstrap service for the domain suffix", async () => {
  const requests = [];
  const provider = new RdapDomainStatusProvider({
    bootstrapUrl: "https://iana.example.test/dns.json",
    fetchImpl: async (url) => {
      requests.push(String(url));
      if (String(url).includes("dns.json")) {
        return new Response(JSON.stringify({
          services: [[
            ["test"],
            ["http://rdap.example.test/", "https://rdap.example.test/"]
          ]]
        }), { status: 200 });
      }
      return new Response("", { status: 404 });
    }
  });

  const result = await provider.check("expired.test");

  assert.equal(result.status, "unregistered");
  assert.deepEqual(requests, [
    "https://iana.example.test/dns.json",
    "https://rdap.example.test/domain/expired.test"
  ]);
});

/** Verifies that the maintainer threshold is strictly greater than twenty. */
test("TooManyMaintainersRule applies the configured exclusive threshold", async () => {
  const thresholdPolicy = new GovernanceThresholdPolicy();
  const rule = new TooManyMaintainersRule({ thresholdPolicy });

  assert.equal((await rule.evaluate(createRuleContext({
    maintainerCount: 20,
    contributorCount: 0
  }))).finding, null);
  const result = await rule.evaluate(createRuleContext({
    maintainerCount: 21,
    contributorCount: 0
  }));

  assert.equal(result.finding.type, SmellTypes.TOO_MANY_MAINTAINERS);
  assert.deepEqual(result.finding.evidenceData, {
    maintainerCount: 21,
    maintainerThreshold: 20,
    metadataSource: "npm Registry",
    metadataScope: "latest package metadata",
    metadataVersion: "2.0.0",
    detectionConfidence: "heuristic"
  });
});

/** Verifies the inclusive one-maintainer-to-forty-contributors boundary. */
test("TooManyContributorsRule applies the inclusive ratio threshold", async () => {
  const thresholdPolicy = new GovernanceThresholdPolicy();
  const rule = new TooManyContributorsRule({ thresholdPolicy });

  assert.equal((await rule.evaluate(createRuleContext({
    maintainerCount: 2,
    contributorCount: 79
  }))).finding, null);
  const result = await rule.evaluate(createRuleContext({
    maintainerCount: 2,
    contributorCount: 80
  }));

  assert.equal(result.finding.type, SmellTypes.TOO_MANY_CONTRIBUTORS);
  assert.equal(result.finding.evidenceData.contributorsPerMaintainer, 40);
});

/** Verifies that publication-only scripts are not classified as install execution. */
test("InstallScriptExecutionRule detects only install lifecycle hooks", async () => {
  const rule = new InstallScriptExecutionRule();
  const node = { id: "sample@1.0.0", name: "sample", version: "1.0.0" };

  assert.equal((await rule.evaluate({
    node,
    manifest: { scripts: { prepublishOnly: "npm test" } },
    metadataSource: "npm Registry",
    metadataScope: "installed package version"
  })).finding, null);
  const result = await rule.evaluate({
    node,
    manifest: { version: "1.0.0", scripts: { postinstall: "node setup.js" } },
    metadataSource: "npm Registry",
    metadataScope: "installed package version"
  });

  assert.deepEqual(result.finding.evidenceData.scriptNames, ["postinstall"]);
});

/** Verifies shared registry requests for latest and exact manifests are cached separately. */
test("NpmRegistryClient caches latest and exact manifest requests", async () => {
  const requests = [];
  const acceptHeaders = [];
  const client = new NpmRegistryClient({
    registryUrl: "https://registry.example.test",
    fetchImpl: async (url, options) => {
      requests.push(String(url));
      acceptHeaders.push(options.headers.Accept);
      const version = String(url).endsWith("/latest") ? "2.0.0" : "1.0.0";
      return new Response(JSON.stringify({ name: "@scope/sample", version }), { status: 200 });
    }
  });

  await Promise.all([
    client.getLatestManifest("@scope/sample"),
    client.getLatestManifest("@scope/sample"),
    client.getVersionManifest("@scope/sample", "1.0.0"),
    client.getVersionManifest("@scope/sample", "1.0.0")
  ]);

  assert.deepEqual(requests.sort(), [
    "https://registry.example.test/%40scope%2Fsample/1.0.0",
    "https://registry.example.test/%40scope%2Fsample/latest"
  ]);
  assert.deepEqual(acceptHeaders, ["application/json", "application/json"]);
});

/** Verifies all four smells through the detector's complete normalized finding contract. */
test("PackageGovernanceDetector emits registry and domain-confirmed findings", async () => {
  const maintainers = [
    { name: "expired-owner", email: "owner@expired-domain.com" },
    ...createPeople(20, "maintainer")
  ];
  const contributors = createPeople(840, "contributor");
  const detector = new PackageGovernanceDetector({
    metadataProvider: {
      async getLatestManifest() {
        return { name: "sample", version: "2.0.0", maintainers, contributors };
      },
      async getVersionManifest() {
        return {
          name: "sample",
          version: "1.0.0",
          scripts: { postinstall: "node setup.js", prepublishOnly: "npm test" }
        };
      }
    },
    domainVerifier: {
      async verify(domain) {
        return domain === "expired-domain.com"
          ? {
              status: "unregistered",
              checkedAt: "2026-09-03T00:00:00.000Z",
              dnsStatus: "unregistered",
              dnsReason: "NXDOMAIN",
              rdapStatus: "unregistered",
              rdapReason: "HTTP 404"
            }
          : {
              status: "registered",
              checkedAt: "2026-09-03T00:00:00.000Z",
              dnsStatus: "registered",
              dnsReason: null,
              rdapStatus: "not-queried",
              rdapReason: null
            };
      }
    }
  });
  const result = await detector.detect({
    project: { packageManager: "npm" },
    graph: {
      nodes: [
        { id: "root", name: "app", version: "1.0.0", dependencyType: "root", depth: 0 },
        { id: "sample@1.0.0", name: "sample", version: "1.0.0", dependencyType: "production", depth: 1 }
      ],
      edges: [{ source: "root", target: "sample@1.0.0", relationship: "direct" }]
    },
    manifests: {
      packageJsonStatus: "present",
      packageJson: { name: "app", version: "1.0.0" },
      packageLock: {
        lockfileVersion: 3,
        packages: {
          "": { name: "app", version: "1.0.0" },
          "node_modules/sample": {
            name: "sample",
            version: "1.0.0",
            hasInstallScript: true
          }
        }
      }
    }
  });

  assert.deepEqual(result.findings.map((finding) => finding.type), [
    SmellTypes.EXPIRED_MAINTAINER_DOMAIN,
    SmellTypes.TOO_MANY_MAINTAINERS,
    SmellTypes.TOO_MANY_CONTRIBUTORS,
    SmellTypes.INSTALL_SCRIPT_EXECUTION
  ]);
  assert.deepEqual(result.warnings, []);
});

/** Verifies missing contributor declarations are reported as unknown rather than zero. */
test("PackageGovernanceDetector does not infer absent contributor metadata", async () => {
  const detector = new PackageGovernanceDetector({
    metadataProvider: {
      async getLatestManifest() {
        return {
          name: "sample",
          version: "1.0.0",
          maintainers: [{ name: "owner", email: "owner@example.com" }]
        };
      }
    },
    governanceRules: [
      new TooManyContributorsRule({ thresholdPolicy: new GovernanceThresholdPolicy() })
    ]
  });
  const result = await detector.detect({
    project: { packageManager: "npm" },
    graph: {
      nodes: [
        { id: "root", name: "app", version: "1.0.0" },
        { id: "sample@1.0.0", name: "sample", version: "1.0.0" }
      ],
      edges: []
    },
    manifests: { packageJsonStatus: "present", packageJson: {}, packageLock: null }
  });

  assert.deepEqual(result.findings, []);
  assert.match(result.warnings[0], /not evaluated for 1 package versions/);
});

/** Verifies root install scripts are detected from the analysed repository manifest. */
test("PackageGovernanceDetector detects root install lifecycle scripts", async () => {
  const detector = new PackageGovernanceDetector({ governanceRules: [] });
  const result = await detector.detect({
    project: { packageManager: "npm" },
    graph: {
      nodes: [{ id: "root", name: "app", version: "1.0.0" }],
      edges: []
    },
    manifests: {
      packageJsonStatus: "present",
      packageJson: {
        name: "app",
        version: "1.0.0",
        scripts: { preinstall: "node verify-environment.js" }
      },
      packageLock: null
    }
  });

  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].affectedPackage, "app");
  assert.equal(result.findings[0].evidenceData.metadataSource, "Code Repository");
});
