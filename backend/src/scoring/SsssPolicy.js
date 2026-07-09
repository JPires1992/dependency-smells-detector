import { BaselineSeverity, BASELINE_SEVERITY_BY_SMELL, SmellTypes } from "../domain/smellCatalog.js";

/** Dimension weights from the dissertation SSSS formula. */
export const SSSS_WEIGHTS = Object.freeze({
  S: 0.3,
  P: 0.25,
  V: 0.3,
  R: 0.15
});

/** Normalized values assigned to each baseline severity label. */
export const BASELINE_SEVERITY_VALUES = Object.freeze({
  [BaselineSeverity.LOW]: 0.25,
  [BaselineSeverity.MEDIUM]: 0.5,
  [BaselineSeverity.HIGH]: 0.75,
  [BaselineSeverity.CRITICAL]: 1
});

/** Looks up the baseline severity label for a smell type. */
export function baselineSeverityForSmell(smellType) {
  return BASELINE_SEVERITY_BY_SMELL[smellType] ?? BaselineSeverity.MEDIUM;
}

/** Converts a smell type baseline severity to its normalized S value. */
export function baselineValueForSmell(smellType) {
  return BASELINE_SEVERITY_VALUES[baselineSeverityForSmell(smellType)];
}

/** Maps the final numerical SSSS score to a qualitative rating. */
export function ratingForScore(score) {
  if (score >= 90) {
    return BaselineSeverity.CRITICAL;
  }

  if (score >= 70) {
    return BaselineSeverity.HIGH;
  }

  if (score >= 40) {
    return BaselineSeverity.MEDIUM;
  }

  return BaselineSeverity.LOW;
}

/** Derives the R dimension from finding evidence and smell-specific defaults. */
export function responsivenessValueForFinding(finding) {
  const evidence = finding.evidenceData ?? {};

  if (typeof evidence.responsivenessValue === "number") {
    return clamp01(evidence.responsivenessValue);
  }

  if (finding.type === SmellTypes.DEPRECATED || evidence.archived === true || evidence.unmaintained === true) {
    return 1;
  }

  if (evidence.blocksAvailableFix === true) {
    return 0.75;
  }

  if ([SmellTypes.PINNED_DEPENDENCY, SmellTypes.RESTRICTIVE_CONSTRAINT].includes(finding.type)) {
    return 0.5;
  }

  if (evidence.activeMaintenance === true) {
    return 0.25;
  }

  return 0.5;
}

/** Derives the V dimension from vulnerability severity, age, or lookup status evidence. */
export function vulnerabilityValueForFinding(finding) {
  const evidence = finding.evidenceData ?? {};

  if (typeof evidence.vulnerabilityValue === "number") {
    return clamp01(evidence.vulnerabilityValue);
  }

  const severity = String(evidence.vulnerabilitySeverity ?? "").toLowerCase();
  if (severity === "critical") {
    return 1;
  }
  if (severity === "high") {
    return 0.8;
  }
  if (severity === "medium") {
    return 0.6;
  }
  if (severity === "low") {
    return 0.3;
  }
  if (severity === "none" || evidence.vulnerabilityLookupStatus === "clean") {
    return 0;
  }

  if (typeof evidence.vulnerabilityAgeDays === "number") {
    if (evidence.vulnerabilityAgeDays > 180) {
      return 1;
    }
    if (evidence.vulnerabilityAgeDays >= 90) {
      return 0.8;
    }
    if (evidence.vulnerabilityAgeDays >= 30) {
      return 0.6;
    }
    if (evidence.vulnerabilityAgeDays >= 0) {
      return 0.3;
    }
  }

  return 0.25;
}

/** Derives the P dimension from dependency type and graph depth. */
export function productionReachabilityValueForNode(node) {
  if (!node) {
    return 0.5;
  }

  if (node.dependencyType === "development") {
    return 0.3;
  }

  if (node.dependencyType === "unused") {
    return 0.1;
  }

  if (node.depth === 1 && node.dependencyType === "production") {
    return 1;
  }

  if (node.depth === 2 && node.dependencyType === "production") {
    return 0.85;
  }

  if (node.depth >= 3 && node.dependencyType === "production") {
    return 0.7;
  }

  if (node.depth === 1) {
    return 0.5;
  }

  return 0.5;
}

/** Keeps externally provided dimension values inside the SSSS 0-1 range. */
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
