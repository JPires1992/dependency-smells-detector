import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadConfiguration } from "../src/configuration/ConfigurationLoader.js";

/** Verifies deterministic precedence and environment-only credential extraction. */
test("loadConfiguration merges defaults, file, environment, and CLI overrides", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "configuration-loader-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const configPath = path.join(directory, "analysis.json");
  await writeFile(configPath, JSON.stringify({
    dirtyWaters: { timeoutMs: 2000 },
    packageGovernance: { concurrency: 6 },
    sourceUsage: { enabled: false }
  }), "utf8");

  const { configuration, credentials } = await loadConfiguration({
    configPath,
    env: {
      GITHUB_API_TOKEN: " github-secret ",
      NODE_AUTH_TOKEN: "registry-secret",
      DIRTY_WATERS_TIMEOUT_MS: "3000",
      NPM_AUDIT_MAX_ATTEMPTS: "5",
      GITHUB_ADVISORY_CONCURRENCY: "7",
      DOMAIN_LOOKUP_TIMEOUT_MS: "7000",
      RDAP_BOOTSTRAP_URL: "https://rdap.example.test/bootstrap.json",
      PEER_SPIN_MAX_TRAVERSAL_NODES: "12000"
    },
    cliOverrides: {
      dirtyWaters: { timeoutMs: 4000 },
      packageGovernance: { required: true }
    }
  });

  assert.equal(configuration.dirtyWaters.timeoutMs, 4000);
  assert.equal(configuration.packageGovernance.concurrency, 6);
  assert.equal(configuration.packageGovernance.required, true);
  assert.equal(configuration.sourceUsage.enabled, false);
  assert.equal(configuration.npmAudit.maxAttempts, 5);
  assert.equal(configuration.githubAdvisories.concurrency, 7);
  assert.equal(configuration.domainLookup.dnsTimeoutMs, 7000);
  assert.equal(configuration.domainLookup.rdapTimeoutMs, 7000);
  assert.equal(
    configuration.domainLookup.rdapBootstrapUrl,
    "https://rdap.example.test/bootstrap.json"
  );
  assert.equal(configuration.peerSpin.maxTraversalNodes, 12000);
  assert.equal(configuration.npmRegistry.timeoutMs, 30000);
  assert.deepEqual(credentials, {
    githubToken: "github-secret",
    npmRegistryToken: "registry-secret"
  });
  assert.equal(Object.hasOwn(configuration, "credentials"), false);
  assert.equal(Object.isFrozen(configuration), true);
  assert.equal(Object.isFrozen(configuration.dirtyWaters), true);
});

/** Verifies the legacy PeerSpin timeout alias cannot override the canonical npm setting. */
test("loadConfiguration normalizes registry timeout aliases", async () => {
  const legacy = await loadConfiguration({
    env: { PEER_SPIN_REGISTRY_TIMEOUT_MS: "45000" }
  });
  const canonical = await loadConfiguration({
    env: {
      PEER_SPIN_REGISTRY_TIMEOUT_MS: "45000",
      NPM_REGISTRY_TIMEOUT_MS: "60000"
    }
  });

  assert.equal(legacy.configuration.npmRegistry.timeoutMs, 45000);
  assert.equal(canonical.configuration.npmRegistry.timeoutMs, 60000);
});

/** Verifies unsupported file properties fail before modules receive ambiguous configuration. */
test("loadConfiguration rejects unknown file properties", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "configuration-loader-invalid-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const configPath = path.join(directory, "analysis.json");
  await writeFile(configPath, JSON.stringify({ npmAudit: { unknownOption: 1 } }), "utf8");

  await assert.rejects(
    () => loadConfiguration({ configPath, env: {} }),
    /unknown property 'npmAudit\.unknownOption'/
  );
});

/** Verifies malformed explicit environment values are reported instead of ignored. */
test("loadConfiguration rejects invalid environment values", async () => {
  await assert.rejects(
    () => loadConfiguration({ env: { NPM_AUDIT_TIMEOUT_MS: "zero" } }),
    /NPM_AUDIT_TIMEOUT_MS must be a positive integer/
  );
  await assert.rejects(
    () => loadConfiguration({ env: { DIRTY_WATERS_AUTO_INSTALL: "yes" } }),
    /DIRTY_WATERS_AUTO_INSTALL must be true or false/
  );
});
