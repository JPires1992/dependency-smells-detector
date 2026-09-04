/** Dispatches analysis to the module registered for a project's package manager. */
export class PackageManagerAnalyzerRegistry {
  /** Configures analyzer modules and domain-specific diagnostic labels. */
  constructor({ analyzers = [], analysisKind, defaultAnalyzerName } = {}) {
    if (!analysisKind || !defaultAnalyzerName) {
      throw new TypeError("PackageManagerAnalyzerRegistry requires diagnostic labels.");
    }

    this.analyzers = [...analyzers];
    this.analysisKind = analysisKind;
    this.defaultAnalyzerName = defaultAnalyzerName;
  }

  /** Registers another package-manager implementation without changing dispatch logic. */
  register(analyzer) {
    this.analyzers.push(analyzer);
  }

  /** Runs the compatible analyzer and normalizes optional failures for orchestration. */
  async analyze(context = {}) {
    const packageManager = context.project?.packageManager;
    const analyzer = this.analyzers.find((candidate) => candidate.supports(packageManager));

    if (!analyzer) {
      return {
        status: "unavailable",
        packages: {},
        warnings: [
          `No ${this.analysisKind} analyzer is registered for package manager '${packageManager}'.`
        ]
      };
    }

    try {
      return await analyzer.analyze(context);
    } catch (error) {
      if (analyzer.required) {
        throw error;
      }

      return {
        status: "unavailable",
        packages: {},
        warnings: [formatAnalyzerError(analyzer, error, this.defaultAnalyzerName)]
      };
    }
  }
}

/** Formats analyzer failures with exactly one terminal punctuation character. */
function formatAnalyzerError(analyzer, error, defaultAnalyzerName) {
  const message = String(error?.message ?? "Unknown error").trim();
  const punctuation = /[.!?]$/.test(message) ? "" : ".";
  return `${analyzer.name ?? defaultAnalyzerName} skipped. Error: ${message}${punctuation}`;
}
