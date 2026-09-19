/** Builds a representative backend document shared by frontend logic and component tests. */
export function createAnalysisDocument() {
  return {
    metadata: {
      schemaVersion: "1.0",
      generatedAt: "2026-09-19T10:00:00.000Z"
    },
    project: {
      name: "sample-app",
      repository: "owner/sample-app",
      packageManager: "npm",
      analysedRef: "main"
    },
    graph: {
      nodes: [
        {
          id: "root",
          name: "sample-app",
          version: "1.0.0",
          dependencyType: "root",
          depth: 0,
          hasSmells: false,
          highestSeverity: null
        },
        {
          id: "parent-package@1.0.0",
          name: "parent-package",
          version: "1.0.0",
          dependencyType: "production",
          depth: 1,
          hasSmells: false,
          highestSeverity: null
        },
        {
          id: "url-package@2.0.0",
          name: "url-package",
          version: "2.0.0",
          dependencyType: "production",
          depth: 2,
          hasSmells: true,
          highestSeverity: "High"
        },
        {
          id: "deprecated-package@3.0.0",
          name: "deprecated-package",
          version: "3.0.0",
          dependencyType: "production",
          depth: 1,
          hasSmells: true,
          highestSeverity: "Medium"
        }
      ],
      edges: [
        {
          source: "parent-package@1.0.0",
          target: "url-package@2.0.0",
          relationship: "transitive",
          smellIds: ["SMELL-001", "SMELL-002"]
        },
        {
          source: "root",
          target: "deprecated-package@3.0.0",
          relationship: "direct",
          smellIds: ["SMELL-003"]
        }
      ]
    },
    smells: [
      {
        id: "SMELL-001",
        type: "URL Dependency",
        affectedPackage: "url-package",
        affectedVersion: "2.0.0",
        detectionSource: "CustomSmellDetector",
        evidence: "Dependency is fetched directly from a URL.",
        score: {
          S: 0.75,
          P: 0.85,
          V: 0.8,
          R: 0.5,
          finalScore: 75.25,
          finalRating: "High",
          baselineSeverity: "High"
        }
      },
      {
        id: "SMELL-002",
        type: "No Provenance",
        affectedPackage: "url-package",
        affectedVersion: "2.0.0",
        detectionSource: "Dirty-Waters",
        evidence: "Package version does not expose provenance metadata.",
        score: {
          S: 0.25,
          P: 0.85,
          V: 0,
          R: 0.25,
          finalScore: 32.5,
          finalRating: "Low",
          baselineSeverity: "Low"
        }
      },
      {
        id: "SMELL-003",
        type: "Deprecated",
        affectedPackage: "deprecated-package",
        affectedVersion: "3.0.0",
        detectionSource: "Dirty-Waters",
        evidence: "Package version is marked as deprecated.",
        score: {
          S: 0.75,
          P: 1,
          V: 0,
          R: 1,
          finalScore: 62.5,
          finalRating: "Medium",
          baselineSeverity: "High"
        }
      }
    ],
    summary: {
      dependenciesAnalysed: 4,
      smellsDetected: 3,
      severityCounts: {
        Low: 1,
        Medium: 1,
        High: 1,
        Critical: 0
      }
    }
  };
}
