/** Selects and executes the responsiveness analyzer registered for a package manager. */
export class ResponsivenessAnalyzerRegistry {
  /** Initializes the registry with independently replaceable analyzer modules. */
  constructor(analyzers = []) {
    this.analyzers = [...analyzers];
  }

  /** Registers an additional package-manager-specific responsiveness analyzer. */
  register(analyzer) {
    this.analyzers.push(analyzer);
  }

  /** Runs the compatible analyzer and converts optional failures into scoring warnings. */
  async analyze(context) {
    const packageManager = context.project?.packageManager;
    const analyzer = this.analyzers.find((candidate) => candidate.supports(packageManager));

    if (!analyzer) {
      return {
        status: "unavailable",
        packages: {},
        warnings: [`No responsiveness analyzer is registered for package manager '${packageManager}'.`]
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
        warnings: [`${analyzer.name ?? "Responsiveness analyzer"} skipped: ${error.message}`]
      };
    }
  }
}
