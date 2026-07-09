import { findNodeForPackage } from "../analysis/PackageLockGraphExtractor.js";
import {
  baselineSeverityForSmell,
  baselineValueForSmell,
  productionReachabilityValueForNode,
  ratingForScore,
  responsivenessValueForFinding,
  SSSS_WEIGHTS,
  vulnerabilityValueForFinding
} from "./SsssPolicy.js";

/** Applies the SSSS formula to detector findings using dependency graph context. */
export class SsssScorer {
  /** Scores a list of findings and assigns stable smell identifiers. */
  scoreFindings(findings, graph) {
    return findings.map((finding, index) => this.scoreFinding(finding, graph, index));
  }

  /** Scores one finding with S, P, V, R, final score, and final rating. */
  scoreFinding(finding, graph, index = 0) {
    const node = findNodeForPackage(graph, finding.affectedPackage, finding.affectedVersion);
    const S = roundDimension(baselineValueForSmell(finding.type));
    const P = roundDimension(productionReachabilityValueForNode(node));
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
