import { PackageManagerAnalyzerRegistry } from "../analysis/PackageManagerAnalyzerRegistry.js";

/** Provides a responsiveness-specific registry over shared package-manager dispatch. */
export class ResponsivenessAnalyzerRegistry extends PackageManagerAnalyzerRegistry {
  /** Initializes independently replaceable responsiveness analyzer modules. */
  constructor(analyzers = []) {
    super({
      analyzers,
      analysisKind: "responsiveness",
      defaultAnalyzerName: "Responsiveness analyzer"
    });
  }
}
