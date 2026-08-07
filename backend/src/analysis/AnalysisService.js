import { ProjectInspector } from "./ProjectInspector.js";
import { DetectorRegistry } from "../detectors/DetectorRegistry.js";
import { DirtyWatersAdapter } from "../detectors/dirty-waters/DirtyWatersAdapter.js";
import { CustomSmellDetector } from "../detectors/custom/CustomSmellDetector.js";
import { SourceUsageSmellDetector } from "../detectors/source-usage/SourceUsageSmellDetector.js";
import { SsssScorer } from "../scoring/SsssScorer.js";
import { JsonAnalysisExporter } from "../exporters/JsonAnalysisExporter.js";
import { MarkdownReportExporter } from "../exporters/MarkdownReportExporter.js";
import { VulnerabilityAnalyzerRegistry } from "../vulnerabilities/VulnerabilityAnalyzerRegistry.js";
import { NpmAuditVulnerabilityAnalyzer } from "../vulnerabilities/NpmAuditVulnerabilityAnalyzer.js";
import { enrichFindingsWithVulnerabilities } from "../vulnerabilities/FindingVulnerabilityEnricher.js";

/** Coordinates project inspection, smell detection, SSSS scoring, and output generation. */
export class AnalysisService {
  /** Wires default backend components while allowing tests or callers to inject alternatives. */
  constructor({
    inspector = new ProjectInspector(),
    detectorRegistry = null,
    vulnerabilityAnalyzerRegistry = null,
    scorer = new SsssScorer(),
    jsonExporter = new JsonAnalysisExporter(),
    markdownExporter = new MarkdownReportExporter()
  } = {}) {
    this.inspector = inspector;
    this.detectorRegistry =
      detectorRegistry ??
      new DetectorRegistry([
        new DirtyWatersAdapter(),
        new CustomSmellDetector(),
        new SourceUsageSmellDetector()
      ]);
    this.vulnerabilityAnalyzerRegistry =
      vulnerabilityAnalyzerRegistry ??
      new VulnerabilityAnalyzerRegistry([
        new NpmAuditVulnerabilityAnalyzer()
      ]);
    this.scorer = scorer;
    this.jsonExporter = jsonExporter;
    this.markdownExporter = markdownExporter;
  }

  /** Runs a full non-interactive analysis and writes JSON plus Markdown artefacts. */
  async analyze({
    target,
    outputDirectory,
    analysedRef = null,
    githubToken = process.env.GITHUB_API_TOKEN,
    workspaceDirectory = process.cwd()
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
        workspaceDirectory
      }),
      this.vulnerabilityAnalyzerRegistry.analyze({
        project,
        graph: inspected.graph,
        manifests: inspected.manifests,
        workspaceDirectory
      })
    ]);
    const warnings = [
      ...(inspected.warnings ?? []),
      ...(detectionResult.warnings ?? []),
      ...(vulnerabilityResult.warnings ?? [])
    ];
    const enrichedFindings = enrichFindingsWithVulnerabilities(
      detectionResult.findings,
      vulnerabilityResult
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
      warnings
    });

    return {
      project,
      graph: jsonResult.document.graph,
      smells,
      summary: jsonResult.document.summary,
      outputs: {
        json: jsonResult.outputPath,
        markdown: markdownResult.outputPath
      },
      warnings
    };
  }
}
