import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projectSmellsOntoGraph } from "../analysis/GraphSmellProjection.js";
import { requireNonEmptyString } from "../utils/ConfigurationValue.js";

/** Builds and writes the structured JSON contract consumed by the frontend layer. */
export class JsonAnalysisExporter {
  /** Configures the schema and application versions written under metadata. */
  constructor({ schemaVersion, toolVersion } = {}) {
    this.schemaVersion = requireNonEmptyString(schemaVersion, "output.schemaVersion");
    this.toolVersion = requireNonEmptyString(toolVersion, "output.toolVersion");
  }

  /** Builds the full analysis result document without writing it to disk. */
  buildDocument({ project, graph, smells, warnings = [] }) {
    const smellGraph = projectSmellsOntoGraph(graph, smells);
    const publicSmells = smells.map(toPublicSmell);

    return {
      metadata: {
        schemaVersion: this.schemaVersion,
        generatedAt: new Date().toISOString(),
        toolVersion: this.toolVersion,
        warnings
      },
      project: {
        name: project.name,
        repository: project.repository,
        packageManager: project.packageManager,
        analysedRef: project.analysedRef
      },
      graph: smellGraph,
      smells: publicSmells,
      summary: buildSummary(graph, smells)
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

/** Removes pipeline-only graph context from the public smell DTO. */
function toPublicSmell(smell) {
  const { graphContext: _graphContext, ...publicSmell } = smell;
  return publicSmell;
}

/** Computes aggregate result counts from the full analysed graph and detected smell list. */
function buildSummary(sourceGraph, smells) {
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
    dependenciesAnalysed: (sourceGraph.nodes ?? []).filter((node) => node.id !== "root").length,
    smellsDetected: smells.length,
    severityCounts
  };
}
