/** Placeholder module for future custom repository and registry smell detectors. */
export class CustomDetectorPlaceholder {
  /** Identifies the module as optional so the pipeline can continue without findings. */
  constructor() {
    this.name = "CustomDetectorPlaceholder";
    this.required = false;
  }

  /** Returns no findings while documenting that custom detectors are not implemented yet. */
  async detect() {
    return {
      findings: [],
      warnings: [
        "Custom repository and package-registry detectors are not implemented yet; the module boundary is reserved for smells not covered by Dirty-Waters."
      ]
    };
  }
}
