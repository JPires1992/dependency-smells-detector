import { BaselineSeverity, BASELINE_SEVERITY_BY_SMELL } from "../domain/SmellCatalog.js";

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

/** Reads the R value produced by ResponsivenessPolicy and rejects incomplete pipeline input. */
export function responsivenessValueForFinding(finding) {
  const value = finding.evidenceData?.responsivenessValue;

  if (!Number.isFinite(value) || value < 0 || value > 1) {
    const packageId = finding.affectedVersion
      ? `${finding.affectedPackage}@${finding.affectedVersion}`
      : finding.affectedPackage;
    throw new Error(
      `Missing or invalid explicit responsiveness evidence for ${packageId ?? "unknown package"}.`
    );
  }

  return value;
}

/** Derives V from the strongest available vulnerability severity or persistence signal. */
export function vulnerabilityValueForFinding(finding) {
  const evidence = finding.evidenceData ?? {};

  if (typeof evidence.vulnerabilityValue === "number") {
    return clamp01(evidence.vulnerabilityValue);
  }

  const severity = String(evidence.vulnerabilitySeverity ?? "").toLowerCase();
  if (evidence.vulnerabilityLookupStatus === "clean" || severity === "none") {
    return 0;
  }

  const values = [
    vulnerabilitySeverityValue(severity),
    vulnerabilityAgeValue(evidence.vulnerabilityAgeDays)
  ].filter((value) => Number.isFinite(value));

  if (values.length > 0) {
    return Math.max(...values);
  }

  return 0.25;
}

/** Maps normalized npm vulnerability severity to the SSSS V scale. */
function vulnerabilitySeverityValue(severity) {
  return ({ critical: 1, high: 0.8, medium: 0.6, low: 0.3 })[
    String(severity ?? "").toLowerCase()
  ] ?? null;
}

/** Maps elapsed advisory disclosure days to the SSSS persistence thresholds. */
function vulnerabilityAgeValue(ageDays) {
  if (!Number.isFinite(ageDays) || ageDays < 0) {
    return null;
  }
  if (ageDays > 180) {
    return 1;
  }
  if (ageDays >= 90) {
    return 0.8;
  }
  if (ageDays >= 30) {
    return 0.6;
  }
  return 0.3;
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

/** Derives P from explicit detector evidence before consulting dependency graph metadata. */
export function productionReachabilityValueForFinding(finding, node) {
  const explicitValue = finding?.evidenceData?.productionReachabilityValue;
  if (typeof explicitValue === "number") {
    return clamp01(explicitValue);
  }

  return productionReachabilityValueForNode(node);
}

/** Keeps externally provided dimension values inside the SSSS 0-1 range. */
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
