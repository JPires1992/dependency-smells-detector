import { enrichFindingsWithVulnerabilities } from "../vulnerabilities/FindingVulnerabilityEnricher.js";
import { enrichFindingsWithResponsiveness } from "../responsiveness/FindingResponsivenessEnricher.js";

/** Coordinates project inspection, smell detection, SSSS scoring, and output generation. */
export class AnalysisService {
  /** Receives pipeline collaborators assembled by the application's composition root. */
  constructor({
    inspector,
    detectorRegistry,
    vulnerabilityAnalyzerRegistry,
    responsivenessAnalyzerRegistry,
    scorer,
    jsonExporter,
    markdownExporter
  } = {}) {
    this.inspector = requireCollaborator(inspector, "inspector", "inspect");
    this.detectorRegistry = requireCollaborator(detectorRegistry, "detectorRegistry", "detect");
    this.vulnerabilityAnalyzerRegistry = requireCollaborator(
      vulnerabilityAnalyzerRegistry,
      "vulnerabilityAnalyzerRegistry",
      "analyze"
    );
    this.responsivenessAnalyzerRegistry = requireCollaborator(
      responsivenessAnalyzerRegistry,
      "responsivenessAnalyzerRegistry",
      "analyze"
    );
    this.scorer = requireCollaborator(scorer, "scorer", "scoreFindings");
    this.jsonExporter = requireCollaborator(jsonExporter, "jsonExporter", "export");
    this.markdownExporter = requireCollaborator(markdownExporter, "markdownExporter", "export");
  }

  /** Runs a full non-interactive analysis and writes JSON plus Markdown artefacts. */
  async analyze({
    target,
    outputDirectory,
    analysedRef = null,
    githubToken = null,
    workspaceDirectory = process.cwd(),
    environment = process.env
  }) {
    const inspected = await this.inspector.inspect({ target, analysedRef, githubToken });
    const project = {
      ...inspected.project,
      analysedRef: analysedRef ?? inspected.project.analysedRef
    };

    const [detectionResult, vulnerabilityResult] = await Promise.all([
      this.detectorRegistry.detect({
        project,
        graph: inspected.graph,
        manifests: inspected.manifests,
        githubToken,
        workspaceDirectory,
        environment
      }),
      this.vulnerabilityAnalyzerRegistry.analyze({
        project,
        graph: inspected.graph,
        manifests: inspected.manifests,
        workspaceDirectory,
        environment
      })
    ]);
    const vulnerabilityFindings = enrichFindingsWithVulnerabilities(
      detectionResult.findings,
      vulnerabilityResult,
      inspected.graph
    );
    const responsivenessResult = await this.responsivenessAnalyzerRegistry.analyze({
      project,
      graph: inspected.graph,
      manifests: inspected.manifests,
      findings: vulnerabilityFindings,
      packageMetadata: detectionResult.packageMetadata ?? {},
      workspaceDirectory,
      environment
    });
    const warnings = [
      ...(inspected.warnings ?? []),
      ...(detectionResult.warnings ?? []),
      ...(vulnerabilityResult.warnings ?? []),
      ...(responsivenessResult.warnings ?? [])
    ];
    const enrichedFindings = enrichFindingsWithResponsiveness(
      vulnerabilityFindings,
      responsivenessResult,
      inspected.graph
    );
    const smells = this.scorer.scoreFindings(enrichedFindings, inspected.graph);

    const jsonResult = await this.jsonExporter.export({
      outputDirectory,
      project,
      graph: inspected.graph,
      smells,
      warnings
    });
    const markdownResult = await this.markdownExporter.export({
      outputDirectory,
      project,
      smells,
      warnings,
      generatedAt: jsonResult.document.metadata?.generatedAt,
      summary: jsonResult.document.summary
    });

    return {
      project,
      graph: jsonResult.document.graph,
      smells: jsonResult.document.smells,
      summary: jsonResult.document.summary,
      outputs: {
        json: jsonResult.outputPath,
        markdown: markdownResult.outputPath
      },
      warnings
    };
  }
}

/** Validates an injected pipeline collaborator and returns it for assignment. */
function requireCollaborator(collaborator, name, operation) {
  if (!collaborator || typeof collaborator[operation] !== "function") {
    throw new TypeError(`AnalysisService requires ${name}.${operation}().`);
  }

  return collaborator;
}
