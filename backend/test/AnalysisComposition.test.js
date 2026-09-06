import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultAnalysisService,
  createDefaultDetectors
} from "../src/composition/createDefaultAnalysisService.js";

/** Verifies the composition root owns the complete ordered default detector set. */
test("createDefaultDetectors builds the production detector pipeline", () => {
  const detectors = createDefaultDetectors();

  assert.deepEqual(
    detectors.map((detector) => detector.name),
    [
      "DirtyWatersAdapter",
      "CustomSmellDetector",
      "PackageGovernanceDetector",
      "PeerSpinDetector",
      "SourceUsageSmellDetector"
    ]
  );
});

/** Verifies module enablement and replacement remain composition concerns. */
test("createDefaultAnalysisService accepts configured and replacement module lists", () => {
  const replacementDetector = { name: "ReplacementDetector", async detect() {} };
  const replacementVulnerabilityAnalyzer = { supports() {}, async analyze() {} };
  const replacementResponsivenessAnalyzer = { supports() {}, async analyze() {} };
  const service = createDefaultAnalysisService({
    configuration: {
      dirtyWaters: { enabled: false },
      packageGovernance: { enabled: false },
      peerSpin: { enabled: false },
      sourceUsage: { enabled: false }
    },
    detectors: [replacementDetector],
    vulnerabilityAnalyzers: [replacementVulnerabilityAnalyzer],
    responsivenessAnalyzers: [replacementResponsivenessAnalyzer]
  });

  assert.deepEqual(service.detectorRegistry.detectors, [replacementDetector]);
  assert.deepEqual(
    service.vulnerabilityAnalyzerRegistry.analyzers,
    [replacementVulnerabilityAnalyzer]
  );
  assert.deepEqual(
    service.responsivenessAnalyzerRegistry.analyzers,
    [replacementResponsivenessAnalyzer]
  );
});

/** Verifies disabled optional detectors leave the always-on custom detector registered. */
test("createDefaultDetectors honors optional module enablement", () => {
  const detectors = createDefaultDetectors({
    dirtyWaters: { enabled: false },
    packageGovernance: { enabled: false },
    peerSpin: { enabled: false },
    sourceUsage: { enabled: false }
  });

  assert.deepEqual(detectors.map((detector) => detector.name), ["CustomSmellDetector"]);
});

/** Verifies all npm metadata consumers receive the same registry client instance. */
test("createDefaultAnalysisService shares one npm registry client", () => {
  const npmRegistryClient = {
    async getLatestManifest() {},
    async getVersionManifest() {},
    async getPackageDocument() {}
  };
  const service = createDefaultAnalysisService({ npmRegistryClient });
  const packageGovernance = service.detectorRegistry.detectors.find(
    (detector) => detector.name === "PackageGovernanceDetector"
  );
  const peerSpin = service.detectorRegistry.detectors.find(
    (detector) => detector.name === "PeerSpinDetector"
  );
  const responsiveness = service.responsivenessAnalyzerRegistry.analyzers[0];

  assert.equal(packageGovernance.metadataProvider, npmRegistryClient);
  assert.equal(peerSpin.registryVerifier.metadataProvider, npmRegistryClient);
  assert.equal(responsiveness.activityProvider.registryClient, npmRegistryClient);
});

/** Verifies resolved application settings are injected into their owning modules. */
test("createDefaultAnalysisService propagates centralized configuration", () => {
  const service = createDefaultAnalysisService({
    configuration: {
      dirtyWaters: {
        timeoutMs: 1001,
        executable: "configured-dirty-waters",
        pipCommand: "configured-pip",
        installSource: "configured-source",
        autoInstall: false
      },
      npmRegistry: {
        registryUrl: "https://registry.example.test",
        timeoutMs: 1002,
        maxAttempts: 2,
        retryDelayMs: 100
      },
      npmAudit: { timeoutMs: 1003, maxAttempts: 3, retryDelayMs: 101 },
      githubAdvisories: {
        apiUrl: "https://api.github.example.test/advisories",
        apiVersion: "2026-03-10",
        timeoutMs: 1010,
        maxAttempts: 2,
        retryDelayMs: 102,
        concurrency: 3
      },
      packageGovernance: { concurrency: 5 },
      domainLookup: {
        dnsTimeoutMs: 1004,
        rdapTimeoutMs: 1005,
        rdapBootstrapUrl: "https://rdap.example.test/bootstrap.json"
      },
      responsiveness: { concurrency: 6 },
      peerSpin: { maxConflicts: 7, verificationConcurrency: 8, maxTraversalNodes: 9 },
      sourceUsage: {
        timeoutMs: 1006,
        downloadTimeoutMs: 1007,
        maxArchiveBytes: 1008,
        maxExtractedBytes: 1009
      },
      output: { schemaVersion: "1.1", toolVersion: "2.0.0" }
    },
    credentials: { githubToken: "github-token", npmRegistryToken: "registry-token" }
  });
  const detectors = Object.fromEntries(
    service.detectorRegistry.detectors.map((detector) => [detector.name, detector])
  );
  const registryClient = detectors.PackageGovernanceDetector.metadataProvider;

  assert.equal(detectors.DirtyWatersAdapter.timeoutMs, 1001);
  assert.equal(detectors.DirtyWatersAdapter.installer.executable, "configured-dirty-waters");
  assert.equal(detectors.DirtyWatersAdapter.installer.autoInstall, false);
  assert.equal(registryClient.registryUrl, "https://registry.example.test");
  assert.equal(registryClient.token, "registry-token");
  assert.equal(registryClient.timeoutMs, 1002);
  assert.equal(detectors.PackageGovernanceDetector.concurrency, 5);
  assert.equal(detectors.PackageGovernanceDetector.governanceRules[0].domainVerifier.dnsProvider.timeoutMs, 1004);
  assert.equal(detectors.PackageGovernanceDetector.governanceRules[0].domainVerifier.rdapProvider.timeoutMs, 1005);
  assert.equal(
    detectors.PackageGovernanceDetector.governanceRules[0].domainVerifier.rdapProvider.bootstrapUrl,
    "https://rdap.example.test/bootstrap.json"
  );
  assert.equal(detectors.PeerSpinDetector.maxConflicts, 7);
  assert.equal(detectors.PeerSpinDetector.verificationConcurrency, 8);
  assert.equal(detectors.PeerSpinDetector.conflictDetector.maxTraversalNodes, 9);
  assert.equal(detectors.SourceUsageSmellDetector.analyzer.timeoutMs, 1006);
  assert.equal(detectors.SourceUsageSmellDetector.workspaceProvider.downloadTimeoutMs, 1007);
  assert.equal(service.vulnerabilityAnalyzerRegistry.analyzers[0].timeoutMs, 1003);
  const advisoryEnricher = service.vulnerabilityAnalyzerRegistry.analyzers[0].persistenceEnricher;
  assert.equal(advisoryEnricher.concurrency, 3);
  assert.equal(advisoryEnricher.advisoryProvider.apiUrl, "https://api.github.example.test/advisories");
  assert.equal(advisoryEnricher.advisoryProvider.token, "github-token");
  assert.equal(advisoryEnricher.advisoryProvider.timeoutMs, 1010);
  assert.equal(service.responsivenessAnalyzerRegistry.analyzers[0].concurrency, 6);
  assert.equal(service.jsonExporter.schemaVersion, "1.1");
  assert.equal(service.jsonExporter.toolVersion, "2.0.0");
});
