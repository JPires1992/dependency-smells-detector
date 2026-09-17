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
    const runtimeDiagnostics = [];
    const packageMetadata = {};

    for (const detector of this.detectors) {
      try {
        const result = await detector.detect(context);
        findings.push(...(result.findings ?? []));
        warnings.push(...(result.warnings ?? []));
        runtimeDiagnostics.push(...(result.runtimeDiagnostics ?? []));
        mergePackageMetadata(packageMetadata, result.packageMetadata);
      } catch (error) {
        if (detector.required) {
          throw error;
        }

        const detectorName = detector.name ?? "Detector";
        warnings.push(`${detectorName} skipped: ${error.message}`);
        if (error.diagnostic) {
          runtimeDiagnostics.push(`${detectorName} diagnostic:\n${error.diagnostic}`);
        }
      }
    }

    return { findings, warnings, runtimeDiagnostics, packageMetadata };
  }
}

/** Merges detector observations by exact package id without discarding earlier fields. */
function mergePackageMetadata(target, incoming = {}) {
  for (const [packageId, metadata] of Object.entries(incoming ?? {})) {
    target[packageId] = {
      ...(target[packageId] ?? {}),
      ...metadata
    };
  }
}
