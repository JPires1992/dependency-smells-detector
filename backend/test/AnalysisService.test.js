import test from "node:test";
import assert from "node:assert/strict";
import { AnalysisService } from "../src/analysis/AnalysisService.js";
import { SmellTypes } from "../src/domain/SmellCatalog.js";

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
    vulnerabilityAnalyzerRegistry: {
      async analyze() {
        return { status: "complete", packages: {}, warnings: [] };
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

/** Verifies that vulnerability evidence is added to findings before the scorer runs. */
test("AnalysisService applies npm audit evidence before SSSS scoring", async () => {
  const graph = {
    nodes: [
      { id: "root", name: "remote-app", version: "1.0.0", dependencyType: "root", depth: 0 },
      {
        id: "example-package@2.0.0",
        name: "example-package",
        version: "2.0.0",
        dependencyType: "production",
        depth: 1
      }
    ],
    edges: [{ source: "root", target: "example-package@2.0.0", relationship: "direct" }]
  };
  const manifests = {
    packageJson: { name: "remote-app" },
    packageLock: { lockfileVersion: 3, packages: {} }
  };
  let exportedSmells = null;
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
          manifests,
          warnings: []
        };
      }
    },
    detectorRegistry: {
      async detect() {
        return {
          findings: [
            {
              type: SmellTypes.DEPRECATED,
              affectedPackage: "example-package",
              affectedVersion: "2.0.0",
              detectionSource: "test",
              evidence: "Deprecated."
            }
          ],
          warnings: []
        };
      }
    },
    vulnerabilityAnalyzerRegistry: {
      async analyze(context) {
        assert.equal(context.manifests, manifests);
        return {
          status: "complete",
          packages: {
            "example-package@2.0.0": {
              severity: "high",
              advisoryCount: 1,
              advisories: []
            }
          },
          warnings: []
        };
      }
    },
    jsonExporter: {
      async export({ smells }) {
        exportedSmells = smells;
        return {
          outputPath: "analysis-results.json",
          document: {
            graph,
            summary: { dependenciesAnalysed: 1, smellsDetected: 1, severityCounts: {} }
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

  await service.analyze({
    target: "owner/remote-app",
    outputDirectory: "reports"
  });

  assert.equal(exportedSmells[0].evidenceData.vulnerabilitySeverity, "high");
  assert.equal(exportedSmells[0].score.V, 0.8);
});
