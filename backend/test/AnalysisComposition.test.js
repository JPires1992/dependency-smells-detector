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
