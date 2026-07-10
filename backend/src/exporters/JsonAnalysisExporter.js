import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projectSmellsOntoGraph } from "../analysis/GraphSmellProjection.js";

/** Builds and writes the structured JSON contract consumed by the frontend layer. */
export class JsonAnalysisExporter {
  /** Configures the output schema version written under metadata. */
  constructor({ schemaVersion = "1.0" } = {}) {
    this.schemaVersion = schemaVersion;
  }

  /** Builds the full analysis result document without writing it to disk. */
  buildDocument({ project, graph, smells, warnings = [] }) {
    const smellGraph = projectSmellsOntoGraph(graph, smells);

    return {
      metadata: {
        schemaVersion: this.schemaVersion,
        generatedAt: new Date().toISOString(),
        toolVersion: process.env.npm_package_version || "0.1.0",
        warnings
      },
      project: {
        name: project.name,
        repository: project.repository,
        packageManager: project.packageManager,
        analysedRef: project.analysedRef
      },
      graph: smellGraph,
      smells,
      summary: buildSummary(smellGraph, smells)
    };
  }

  /** Writes the analysis result JSON file to the requested output directory. */
  async export({ outputDirectory, fileName = "analysis-results.json", project, graph, smells, warnings = [] }) {
    await mkdir(outputDirectory, { recursive: true });
    const document = this.buildDocument({ project, graph, smells, warnings });
    const outputPath = path.join(outputDirectory, fileName);
    await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    return { outputPath, document };
  }
}

/** Computes aggregate result counts required by the JSON contract summary section. */
function buildSummary(graph, smells) {
  const severityCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0
  };

  for (const smell of smells) {
    severityCounts[smell.score.finalRating] += 1;
  }

  return {
    dependenciesAnalysed: Math.max(0, graph.nodes.length - 1),
    smellsDetected: smells.length,
    severityCounts
  };
}
