import test from "node:test";
import assert from "node:assert/strict";
import { SsssScorer } from "../src/scoring/SsssScorer.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";

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
      vulnerabilitySeverity: "high",
      responsivenessValue: 1
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

/** Verifies explicit detector reachability prevents accidental transitive-node scoring. */
test("SsssScorer honors explicit reachability evidence for missing dependencies", () => {
  const graph = {
    nodes: [{
      id: "missing@1.0.0",
      name: "missing",
      version: "1.0.0",
      dependencyType: "production",
      depth: 3
    }],
    edges: []
  };
  const finding = {
    type: SmellTypes.MISSING_DEPENDENCY,
    affectedPackage: "missing",
    affectedVersion: null,
    detectionSource: "KnipAdapter",
    evidence: "Missing.",
    evidenceData: {
      productionReachabilityValue: 0.5,
      responsivenessValue: 0.5
    }
  };

  const [scored] = new SsssScorer().scoreFindings([finding], graph);

  assert.equal(scored.score.P, 0.5);
});

/** Verifies a missing exact version cannot inherit reachability from another package version. */
test("SsssScorer does not resolve an unavailable version by package name", () => {
  const graph = {
    nodes: [{
      id: "sample@1.0.0",
      name: "sample",
      version: "1.0.0",
      dependencyType: "production",
      depth: 1
    }],
    edges: []
  };
  const finding = {
    type: SmellTypes.NO_PROVENANCE,
    affectedPackage: "sample",
    affectedVersion: "2.0.0",
    detectionSource: "test",
    evidence: "Exact version is absent from the graph.",
    evidenceData: {
      vulnerabilityLookupStatus: "clean",
      responsivenessValue: 0.5
    }
  };

  const [scored] = new SsssScorer().scoreFindings([finding], graph);

  assert.equal(scored.score.P, 0.5);
});

/** Verifies scoring cannot silently replace missing responsiveness analysis with a fallback. */
test("SsssScorer rejects findings without explicit responsiveness evidence", () => {
  const finding = {
    type: SmellTypes.NO_PROVENANCE,
    affectedPackage: "example-package",
    affectedVersion: "1.0.0",
    detectionSource: "test",
    evidence: "Missing responsiveness evidence."
  };

  assert.throws(
    () => new SsssScorer().scoreFindings([finding], { nodes: [], edges: [] }),
    /missing or invalid explicit responsiveness evidence/i
  );
});
