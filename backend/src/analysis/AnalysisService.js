import { ProjectInspector } from "./ProjectInspector.js";
import { DetectorRegistry } from "../detectors/DetectorRegistry.js";
import { DirtyWatersAdapter } from "../detectors/dirty-waters/DirtyWatersAdapter.js";
import { CustomDetectorPlaceholder } from "../detectors/custom/CustomDetectorPlaceholder.js";
import { SsssScorer } from "../scoring/SsssScorer.js";
import { JsonAnalysisExporter } from "../exporters/JsonAnalysisExporter.js";
import { MarkdownReportExporter } from "../exporters/MarkdownReportExporter.js";

/** Coordinates project inspection, smell detection, SSSS scoring, and output generation. */
export class AnalysisService {
  /** Wires default backend components while allowing tests or callers to inject alternatives. */
  constructor({
    inspector = new ProjectInspector(),
    detectorRegistry = null,
    scorer = new SsssScorer(),
    jsonExporter = new JsonAnalysisExporter(),
    markdownExporter = new MarkdownReportExporter()
  } = {}) {
    this.inspector = inspector;
    this.detectorRegistry =
      detectorRegistry ??
      new DetectorRegistry([
        new DirtyWatersAdapter(),
        new CustomDetectorPlaceholder()
      ]);
    this.scorer = scorer;
    this.jsonExporter = jsonExporter;
    this.markdownExporter = markdownExporter;
  }

  /** Runs a full non-interactive analysis and writes JSON plus Markdown artefacts. */
  async analyze({
    target,
    outputDirectory,
    packageManager = null,
    githubRepository = null,
    analysedRef = null,
    githubToken = process.env.GITHUB_API_TOKEN,
    workspaceDirectory = process.cwd()
  }) {
    const inspected = await this.inspector.inspect({ target, packageManager, githubRepository, analysedRef, githubToken });
    const project = {
      ...inspected.project,
      analysedRef
    };

    const detectionResult = await this.detectorRegistry.detect({
      project,
      graph: inspected.graph,
      githubRepository,
      githubToken,
      workspaceDirectory
    });
    const warnings = [...inspected.warnings, ...detectionResult.warnings];
    const smells = this.scorer.scoreFindings(detectionResult.findings, inspected.graph);

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
