import { PackageGraphIndex } from "../analysis/PackageGraphIndex.js";
import {
  baselineSeverityForSmell,
  baselineValueForSmell,
  productionReachabilityValueForFinding,
  ratingForScore,
  responsivenessValueForFinding,
  SSSS_WEIGHTS,
  vulnerabilityValueForFinding
} from "./SsssPolicy.js";

/** Applies the SSSS formula to detector findings using dependency graph context. */
export class SsssScorer {
  /** Scores a list of findings and assigns stable smell identifiers. */
  scoreFindings(findings, graph) {
    const graphIndex = new PackageGraphIndex(graph);
    return findings.map((finding, index) => this.scoreFinding(finding, graphIndex, index));
  }

  /** Scores one finding with S, P, V, R, final score, and final rating. */
  scoreFinding(finding, graphOrIndex, index = 0) {
    const graphIndex = graphOrIndex instanceof PackageGraphIndex
      ? graphOrIndex
      : new PackageGraphIndex(graphOrIndex);
    const node = graphIndex.resolveFinding(finding);
    const S = roundDimension(baselineValueForSmell(finding.type));
    const P = roundDimension(productionReachabilityValueForFinding(finding, node));
    const V = roundDimension(vulnerabilityValueForFinding(finding));
    const R = roundDimension(responsivenessValueForFinding(finding));
    const finalScore = roundScore(100 * (SSSS_WEIGHTS.S * S + SSSS_WEIGHTS.P * P + SSSS_WEIGHTS.V * V + SSSS_WEIGHTS.R * R));

    return {
      id: `SMELL-${String(index + 1).padStart(3, "0")}`,
      type: finding.type,
      affectedPackage: finding.affectedPackage,
      affectedVersion: finding.affectedVersion,
      detectionSource: finding.detectionSource,
      evidence: finding.evidence,
      ...(finding.graphContext ? { graphContext: finding.graphContext } : {}),
      evidenceData: finding.evidenceData ?? {},
      score: {
        S,
        P,
        V,
        R,
        finalScore,
        finalRating: ratingForScore(finalScore),
        baselineSeverity: baselineSeverityForSmell(finding.type)
      }
    };
  }
}

/** Rounds normalized SSSS dimensions to two decimal places. */
function roundDimension(value) {
  return Number(value.toFixed(2));
}

/** Rounds final SSSS scores to two decimal places. */
function roundScore(value) {
  return Number(value.toFixed(2));
}
