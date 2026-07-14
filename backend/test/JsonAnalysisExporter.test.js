import test from "node:test";
import assert from "node:assert/strict";
import { JsonAnalysisExporter } from "../src/exporters/JsonAnalysisExporter.js";

/** Verifies that exported JSON follows the backend/frontend analysis contract. */
test("JsonAnalysisExporter builds the documented JSON contract", () => {
  const exporter = new JsonAnalysisExporter();
  const document = exporter.buildDocument({
    project: {
      name: "sample-app",
      repository: "owner/sample-app",
      packageManager: "npm",
      analysedRef: "main"
    },
    graph: {
      nodes: [
        { id: "root", name: "sample-app", version: "1.0.0", dependencyType: "root", depth: 0 },
        { id: "react@18.2.0", name: "react", version: "18.2.0", dependencyType: "production", depth: 1 },
        { id: "scheduler@0.23.2", name: "scheduler", version: "0.23.2", dependencyType: "production", depth: 2 }
      ],
      edges: [
        { source: "root", target: "react@18.2.0", relationship: "direct" },
        { source: "react@18.2.0", target: "scheduler@0.23.2", relationship: "transitive" }
      ]
    },
    smells: [
      {
        id: "SMELL-001",
        type: "Deprecated",
        affectedPackage: "react",
        affectedVersion: "18.2.0",
        detectionSource: "Dirty-Waters",
        evidence: "test",
        score: {
          finalScore: 86.5,
          finalRating: "High"
        }
      }
    ]
  });

  assert.equal(document.metadata.schemaVersion, "1.0");
  assert.equal(document.project.repository, "owner/sample-app");
  const reactNode = document.graph.nodes.find((node) => node.id === "react@18.2.0");
  assert.equal(reactNode.hasSmells, true);
  assert.equal(reactNode.highestSeverity, "High");
  assert.deepEqual(document.graph.edges, [
    {
      source: "root",
      target: "react@18.2.0",
      relationship: "direct",
      smellIds: ["SMELL-001"]
    }
  ]);
  assert.equal(document.summary.dependenciesAnalysed, 2);
  assert.equal(document.summary.smellsDetected, 1);
  assert.equal(document.summary.severityCounts.High, 1);
});
