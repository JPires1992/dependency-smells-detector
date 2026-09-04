import test from "node:test";
import assert from "node:assert/strict";
import { PackageManagerAnalyzerRegistry } from "../src/analysis/PackageManagerAnalyzerRegistry.js";
import { ResponsivenessAnalyzerRegistry } from "../src/responsiveness/ResponsivenessAnalyzerRegistry.js";
import { VulnerabilityAnalyzerRegistry } from "../src/vulnerabilities/VulnerabilityAnalyzerRegistry.js";

/** Verifies domain registries remain distinct while sharing package-manager dispatch. */
test("specialized analyzer registries share dispatch without sharing registrations", async () => {
  const vulnerabilityRegistry = new VulnerabilityAnalyzerRegistry();
  const responsivenessRegistry = new ResponsivenessAnalyzerRegistry();
  const analyzerResult = { status: "complete", packages: {}, warnings: [] };

  vulnerabilityRegistry.register({
    supports: (packageManager) => packageManager === "future-pm",
    analyze: async () => analyzerResult
  });

  assert.equal(vulnerabilityRegistry instanceof PackageManagerAnalyzerRegistry, true);
  assert.equal(responsivenessRegistry instanceof PackageManagerAnalyzerRegistry, true);
  assert.equal(
    await vulnerabilityRegistry.analyze({ project: { packageManager: "future-pm" } }),
    analyzerResult
  );
  assert.deepEqual(responsivenessRegistry.analyzers, []);
});

/** Verifies missing implementations retain a domain-specific unavailable result. */
test("specialized analyzer registries describe unsupported package managers", async () => {
  const vulnerability = await new VulnerabilityAnalyzerRegistry().analyze({
    project: { packageManager: "future-pm" }
  });
  const responsiveness = await new ResponsivenessAnalyzerRegistry().analyze({
    project: { packageManager: "future-pm" }
  });

  assert.match(vulnerability.warnings[0], /No vulnerability analyzer/);
  assert.match(responsiveness.warnings[0], /No responsiveness analyzer/);
});

/** Verifies optional errors become warnings while required analyzer errors propagate. */
test("PackageManagerAnalyzerRegistry applies analyzer required policy", async () => {
  const optionalRegistry = new VulnerabilityAnalyzerRegistry([{
    name: "OptionalAnalyzer",
    required: false,
    supports: () => true,
    analyze: async () => { throw new Error("Registry unavailable."); }
  }]);
  const requiredRegistry = new VulnerabilityAnalyzerRegistry([{
    name: "RequiredAnalyzer",
    required: true,
    supports: () => true,
    analyze: async () => { throw new Error("Mandatory failure"); }
  }]);

  const optional = await optionalRegistry.analyze({ project: { packageManager: "npm" } });

  assert.equal(
    optional.warnings[0],
    "OptionalAnalyzer skipped. Error: Registry unavailable."
  );
  await assert.rejects(
    () => requiredRegistry.analyze({ project: { packageManager: "npm" } }),
    /Mandatory failure/
  );
});
