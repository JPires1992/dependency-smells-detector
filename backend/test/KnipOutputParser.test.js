import test from "node:test";
import assert from "node:assert/strict";
import { KnipOutputParser } from "../src/detectors/source-usage/KnipOutputParser.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";

/** Verifies normalized findings for runtime, development, and missing dependencies. */
test("KnipOutputParser maps source-usage issues to smell findings", () => {
  const parser = new KnipOutputParser();
  const graph = {
    nodes: [
      { id: "root", name: "app", version: "1.0.0", dependencyType: "root", depth: 0 },
      { id: "unused@2.0.0", name: "unused", version: "2.0.0", dependencyType: "production", depth: 1 },
      { id: "unused-dev@3.0.0", name: "unused-dev", version: "3.0.0", dependencyType: "development", depth: 1 }
    ],
    edges: [
      { source: "root", target: "unused@2.0.0", relationship: "direct" },
      { source: "root", target: "unused-dev@3.0.0", relationship: "direct" }
    ]
  };
  const result = parser.parse({
    issues: [
      {
        file: "package.json",
        dependencies: [{ name: "unused", line: 5, col: 6 }],
        devDependencies: [{ name: "unused-dev", line: 8, col: 6 }]
      },
      {
        file: "src/index.js",
        unlisted: [
          { name: "missing", line: 2, col: 8 },
          { name: "missing", line: 3, col: 8 }
        ]
      }
    ]
  }, {
    project: { name: "app" },
    graph,
    manifests: {
      packageJson: {
        dependencies: { unused: "^2.0.0" },
        devDependencies: { "unused-dev": "^3.0.0" }
      }
    }
  });

  assert.deepEqual(result.findings.map((finding) => finding.type), [
    SmellTypes.UNUSED_DEPENDENCY,
    SmellTypes.UNUSED_DEPENDENCY,
    SmellTypes.MISSING_DEPENDENCY
  ]);
  assert.equal(result.findings[0].affectedVersion, "2.0.0");
  assert.equal(result.findings[0].evidenceData.dependencyType, "production");
  assert.equal(result.findings[0].evidenceData.analyzerIssueType, "dependencies");
  assert.equal(result.findings[1].affectedVersion, "3.0.0");
  assert.equal(result.findings[1].evidenceData.dependencyType, "development");
  assert.equal(result.findings[1].evidenceData.analyzerIssueType, "devDependencies");
  assert.equal(result.findings[2].affectedVersion, null);
  assert.equal(result.findings[2].evidenceData.usageLocations.length, 2);
  assert.deepEqual(result.findings[2].evidenceData.graphContext.parentNodeIds, ["root"]);
  assert.deepEqual(result.warnings, []);
});
