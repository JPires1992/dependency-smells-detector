import { KnipOutputParser } from "./KnipOutputParser.js";
import { requireBoolean } from "../../utils/ConfigurationValue.js";

/** Coordinates remote source materialization, Knip analysis, and finding normalization. */
export class SourceUsageSmellDetector {
  /** Configures replaceable workspace, analyzer, parser, and failure behavior modules. */
  constructor({
    workspaceProvider,
    analyzer,
    parser = new KnipOutputParser(),
    required
  } = {}) {
    this.name = "SourceUsageSmellDetector";
    this.workspaceProvider = workspaceProvider;
    this.analyzer = analyzer;
    this.parser = parser;
    this.required = requireBoolean(required, "sourceUsage.required");
  }

  /** Detects unused and missing dependencies against the exact analysed repository ref. */
  async detect(context) {
    if (context.manifests?.packageJsonStatus !== "present") {
      return {
        findings: [],
        warnings: ["Source-usage analysis was skipped because package.json was unavailable."]
      };
    }

    const lease = await this.workspaceProvider.materialize({
      repository: context.project.repository,
      ref: context.project.analysedRef,
      token: context.githubToken
    });

    try {
      const analysis = await this.analyzer.analyze({
        projectDirectory: lease.directory,
        env: context.environment ?? {}
      });
      const parsed = this.parser.parse(analysis.report, context);

      return {
        findings: parsed.findings,
        warnings: [...(analysis.warnings ?? []), ...(parsed.warnings ?? [])]
      };
    } finally {
      await lease.cleanup();
    }
  }
}
