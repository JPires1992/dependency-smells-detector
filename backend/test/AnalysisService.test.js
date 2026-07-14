import test from "node:test";
import assert from "node:assert/strict";
import { AnalysisService } from "../src/analysis/AnalysisService.js";

/** Verifies that inspector-resolved refs are preserved by the orchestration service. */
test("AnalysisService preserves inspector-resolved analysed refs", async () => {
  const graph = {
    nodes: [{ id: "root", name: "remote-app", version: "1.0.0", dependencyType: "root", depth: 0 }],
    edges: []
  };
  const detectorProjects = [];
  const service = new AnalysisService({
    inspector: {
      async inspect() {
        return {
          project: {
            name: "remote-app",
            repository: "owner/remote-app",
            packageManager: "npm",
            analysedRef: "main"
          },
          graph,
          warnings: []
        };
      }
    },
    detectorRegistry: {
      async detect({ project }) {
        detectorProjects.push(project);
        return { findings: [], warnings: [] };
      }
    },
    jsonExporter: {
      async export({ project }) {
        return {
          outputPath: "analysis-results.json",
          document: {
            graph,
            summary: { dependenciesAnalysed: 0, smellsDetected: 0, severityCounts: {} },
            project
          }
        };
      }
    },
    markdownExporter: {
      async export() {
        return { outputPath: "analysis-report.md" };
      }
    }
  });

  const result = await service.analyze({
    target: "owner/remote-app",
    outputDirectory: "reports"
  });

  assert.equal(result.project.analysedRef, "main");
  assert.equal(detectorProjects[0].analysedRef, "main");
});
