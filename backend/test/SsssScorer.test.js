import test from "node:test";
import assert from "node:assert/strict";
import { SsssScorer } from "../src/scoring/SsssScorer.js";
import { SmellTypes } from "../src/domain/smellCatalog.js";

/** Verifies that the implementation matches the SSSS example from the dissertation. */
test("SsssScorer reproduces the deprecated production dependency example", () => {
  const scorer = new SsssScorer();
  const graph = {
    nodes: [
      { id: "root", name: "app", version: "1.0.0", dependencyType: "root", depth: 0 },
      { id: "example-package@1.0.0", name: "example-package", version: "1.0.0", dependencyType: "production", depth: 1 }
    ],
    edges: [{ source: "root", target: "example-package@1.0.0", relationship: "direct" }]
  };
  const finding = {
    type: SmellTypes.DEPRECATED,
    affectedPackage: "example-package",
    affectedVersion: "1.0.0",
    detectionSource: "Dirty-Waters",
    evidence: "Package is marked as deprecated.",
    evidenceData: {
      vulnerabilitySeverity: "high"
    }
  };

  const [scored] = scorer.scoreFindings([finding], graph);

  assert.equal(scored.score.S, 0.75);
  assert.equal(scored.score.P, 1);
  assert.equal(scored.score.V, 0.8);
  assert.equal(scored.score.R, 1);
  assert.equal(scored.score.finalScore, 86.5);
  assert.equal(scored.score.finalRating, "High");
});
