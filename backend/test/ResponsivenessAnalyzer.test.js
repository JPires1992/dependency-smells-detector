import test from "node:test";
import assert from "node:assert/strict";
import { SmellTypes } from "../src/domain/SmellCatalog.js";
import { NpmPackageActivityProvider } from "../src/responsiveness/NpmPackageActivityProvider.js";
import { NpmResponsivenessAnalyzer } from "../src/responsiveness/NpmResponsivenessAnalyzer.js";
import { ResponsivenessPolicy } from "../src/responsiveness/ResponsivenessPolicy.js";
import { enrichFindingsWithResponsiveness } from "../src/responsiveness/FindingResponsivenessEnricher.js";

/** Creates a minimal finding with optional vulnerability fix evidence. */
function createFinding({
  type = SmellTypes.NO_PROVENANCE,
  fixAvailable = false,
  fixVersion = null
} = {}) {
  return {
    type,
    affectedPackage: "sample",
    affectedVersion: "1.0.0",
    detectionSource: "test",
    evidence: "Test finding.",
    evidenceData: {
      vulnerabilityFixAvailable: fixAvailable,
      vulnerabilityFix: fixVersion ? { version: fixVersion } : null
    }
  };
}

/** Creates normalized npm activity at a selected age and annual release frequency. */
function createActivity(daysSinceLatestRelease, releasesLastYear) {
  return {
    status: "complete",
    latestVersion: "2.0.0",
    latestReleaseAt: "2026-01-01T00:00:00.000Z",
    daysSinceLatestRelease,
    releasesLastYear,
    installedVersionDeprecated: false,
    metadataSource: "npm Registry"
  };
}

/** Verifies release dates and installed-version deprecation from npm package history. */
test("NpmPackageActivityProvider derives release history from a package document", async () => {
  const provider = new NpmPackageActivityProvider({
    registryClient: {
      async getPackageDocument() {
        return {
          name: "sample",
          "dist-tags": { latest: "2.0.0" },
          versions: {
            "1.0.0": { deprecated: "Use 2.x." },
            "1.5.0": {},
            "2.0.0": {}
          },
          time: {
            "1.0.0": "2024-12-31T00:00:00.000Z",
            "1.5.0": "2025-09-01T00:00:00.000Z",
            "2.0.0": "2025-12-01T00:00:00.000Z"
          }
        };
      }
    }
  });

  const activity = await provider.getActivity(
    "sample",
    "1.0.0",
    new Date("2026-01-01T00:00:00.000Z")
  );

  assert.equal(activity.daysSinceLatestRelease, 31);
  assert.equal(activity.releasesLastYear, 2);
  assert.equal(activity.installedVersionDeprecated, true);
});

/** Verifies every documented R class is selected from explicit package evidence. */
test("ResponsivenessPolicy maps maintenance and update evidence to R values", () => {
  const policy = new ResponsivenessPolicy();
  const finding = createFinding();

  assert.equal(policy.evaluate({
    finding,
    packageMetadata: { archived: true, metadataSource: "Dirty-Waters" }
  }).responsivenessValue, 1);
  assert.equal(policy.evaluate({
    finding: createFinding({ fixAvailable: true, fixVersion: "1.0.1" }),
    updateStrategy: {
      constraintKind: "pinned",
      declaredConstraint: "1.0.0",
      normalizedRange: "1.0.0"
    }
  }).responsivenessValue, 0.75);
  assert.equal(policy.evaluate({
    finding: createFinding({ fixAvailable: true, fixVersion: "1.5.0" }),
    activity: createActivity(30, 8),
    updateStrategy: {
      constraintKind: "restrictive",
      declaredConstraint: ">=1 <2",
      normalizedRange: ">=1.0.0 <2.0.0-0"
    }
  }).responsivenessValue, 0.5);
  assert.equal(policy.evaluate({
    finding,
    activity: createActivity(731, 0)
  }).responsivenessValue, 0.75);
  assert.equal(policy.evaluate({
    finding,
    activity: createActivity(30, 8),
    updateStrategy: { constraintKind: "restrictive", declaredConstraint: "<2" }
  }).responsivenessValue, 0.5);
  assert.equal(policy.evaluate({
    finding,
    activity: createActivity(30, 8)
  }).responsivenessValue, 0.1);
  assert.equal(policy.evaluate({
    finding,
    activity: createActivity(30, 1)
  }).responsivenessValue, 0.25);
  assert.equal(policy.evaluate({ finding }).responsivenessClassification, "metadata-unavailable");
});

/** Verifies package deduplication and explicit unavailable evidence across all findings. */
test("NpmResponsivenessAnalyzer creates one profile per smelled package", async () => {
  let activityRequests = 0;
  const analyzer = new NpmResponsivenessAnalyzer({
    activityProvider: {
      async getActivity() {
        activityRequests += 1;
        return createActivity(20, 5);
      }
    },
    clock: () => new Date("2026-01-01T00:00:00.000Z")
  });
  const findings = [
    createFinding(),
    createFinding({ type: SmellTypes.NO_CODE_SIGNATURE })
  ];
  const result = await analyzer.analyze({ findings, manifests: { packageJson: {} } });
  const enriched = enrichFindingsWithResponsiveness(findings, result);

  assert.equal(activityRequests, 1);
  assert.equal(result.packages["sample@1.0.0"].responsivenessValue, 0.1);
  assert.deepEqual(enriched.map((finding) => finding.evidenceData.responsivenessValue), [0.1, 0.1]);
});

/** Verifies root findings use GitHub activity without resolving a same-named public npm package. */
test("NpmResponsivenessAnalyzer isolates project-root activity from npm registry packages", async () => {
  let activityRequests = 0;
  const analyzer = new NpmResponsivenessAnalyzer({
    activityProvider: {
      async getActivity() {
        activityRequests += 1;
        return createActivity(2_000, 0);
      }
    },
    clock: () => new Date("2026-01-31T00:00:00.000Z")
  });
  const rootFinding = {
    ...createFinding(),
    affectedPackage: "frontend",
    affectedVersion: "0.0.0",
    graphContext: { nodeId: "root" }
  };
  const result = await analyzer.analyze({
    findings: [rootFinding],
    project: {
      repositoryMetadata: {
        archived: false,
        pushedAt: "2026-01-20T00:00:00.000Z",
        metadataSource: "GitHub Repository"
      }
    },
    graph: {
      nodes: [
        { id: "root", name: "frontend", version: "0.0.0", dependencyType: "root", depth: 0 },
        { id: "frontend@0.0.0", name: "frontend", version: "0.0.0", dependencyType: "production", depth: 1 }
      ],
      edges: [{ source: "root", target: "frontend@0.0.0", relationship: "direct" }]
    },
    packageMetadata: {
      "frontend@0.0.0": {
        archived: true,
        deprecated: true,
        metadataSource: "npm Registry"
      }
    }
  });
  const evidence = result.packages.root;

  assert.equal(activityRequests, 0);
  assert.equal(result.status, "complete");
  assert.equal(evidence.responsivenessValue, 0.25);
  assert.equal(evidence.responsivenessClassification, "recent-repository-activity");
  assert.equal(evidence.daysSinceLatestRepositoryActivity, 11);
  assert.deepEqual(evidence.responsivenessSources, ["GitHub Repository"]);
  assert.equal(evidence.latestVersion, undefined);

  const [enriched] = enrichFindingsWithResponsiveness(
    [rootFinding],
    result,
    {
      nodes: [
        { id: "root", name: "frontend", version: "0.0.0" },
        { id: "frontend@0.0.0", name: "frontend", version: "0.0.0" }
      ],
      edges: []
    }
  );
  assert.equal(enriched.evidenceData.responsivenessValue, 0.25);
});

/** Verifies missing root activity is explicit and never triggers an npm package-name lookup. */
test("NpmResponsivenessAnalyzer records unavailable project-root activity explicitly", async () => {
  let activityRequests = 0;
  const analyzer = new NpmResponsivenessAnalyzer({
    activityProvider: {
      async getActivity() {
        activityRequests += 1;
        return createActivity(20, 5);
      }
    }
  });
  const rootFinding = {
    ...createFinding(),
    affectedPackage: "frontend",
    affectedVersion: "0.0.0",
    graphContext: { nodeId: "root" }
  };
  const result = await analyzer.analyze({
    findings: [rootFinding],
    project: {},
    graph: {
      nodes: [{ id: "root", name: "frontend", version: "0.0.0" }],
      edges: []
    }
  });

  assert.equal(activityRequests, 0);
  assert.equal(result.status, "partial");
  assert.equal(result.packages.root.responsivenessValue, 0.5);
  assert.equal(
    result.packages.root.responsivenessClassification,
    "metadata-unavailable"
  );
  assert.match(result.warnings[1], /GitHub repository activity metadata is unavailable/);
});

/** Verifies a direct restrictive constraint and available fix produce high remediation delay. */
test("NpmResponsivenessAnalyzer applies constraints only to direct package nodes", async () => {
  const analyzer = new NpmResponsivenessAnalyzer({
    activityProvider: {
      async getActivity() {
        return createActivity(20, 5);
      }
    }
  });
  const directFinding = createFinding({ fixAvailable: true, fixVersion: "1.0.1" });
  const transitiveFinding = {
    ...createFinding({ fixAvailable: true, fixVersion: "1.0.1" }),
    affectedVersion: "2.0.0"
  };
  const result = await analyzer.analyze({
    findings: [directFinding, transitiveFinding],
    manifests: {
      packageJson: { dependencies: { sample: "1.0.0" } }
    },
    graph: {
      nodes: [
        { id: "root", name: "app", version: "1.0.0" },
        { id: "sample@1.0.0", name: "sample", version: "1.0.0" },
        { id: "sample@2.0.0", name: "sample", version: "2.0.0" }
      ],
      edges: [
        { source: "root", target: "sample@1.0.0", relationship: "direct" },
        { source: "parent@1.0.0", target: "sample@2.0.0", relationship: "transitive" }
      ]
    }
  });

  assert.equal(result.packages["sample@1.0.0"].responsivenessValue, 0.75);
  assert.equal(result.packages["sample@2.0.0"].responsivenessValue, 0.1);
});

/** Verifies optional registry failures retain an auditable conservative R value. */
test("NpmResponsivenessAnalyzer records unavailable activity without implicit fallback", async () => {
  const analyzer = new NpmResponsivenessAnalyzer({
    activityProvider: {
      async getActivity() {
        throw new Error("registry unavailable");
      }
    }
  });
  const result = await analyzer.analyze({
    findings: [createFinding()],
    manifests: { packageJson: {} }
  });

  assert.equal(result.status, "partial");
  assert.equal(result.packages["sample@1.0.0"].responsivenessValue, 0.5);
  assert.equal(
    result.packages["sample@1.0.0"].responsivenessClassification,
    "metadata-unavailable"
  );
  assert.match(result.warnings[0], /coverage incomplete/i);
});
