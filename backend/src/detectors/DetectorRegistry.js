/** Holds detector modules and executes them behind a common detector interface. */
export class DetectorRegistry {
  /** Initializes the registry with zero or more detector instances. */
  constructor(detectors = []) {
    this.detectors = [...detectors];
  }

  /** Adds a detector implementation without changing scoring or exporters. */
  register(detector) {
    this.detectors.push(detector);
  }

  /** Runs every registered detector and aggregates findings and warnings. */
  async detect(context) {
    const findings = [];
    const warnings = [];

    for (const detector of this.detectors) {
      try {
        const result = await detector.detect(context);
        findings.push(...(result.findings ?? []));
        warnings.push(...(result.warnings ?? []));
      } catch (error) {
        if (detector.required) {
          throw error;
        }

        warnings.push(`${detector.name ?? "Detector"} skipped: ${error.message}`);
      }
    }

    return { findings, warnings };
  }
}
