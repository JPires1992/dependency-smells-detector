import { PackageGraphIndex } from "../analysis/PackageGraphIndex.js";
import { toPackageNodeId } from "../domain/PackageIdentifier.js";

/** Adds normalized package responsiveness evidence before SSSS scoring. */
export function enrichFindingsWithResponsiveness(findings, responsivenessResult, graph = {}) {
  const packages = responsivenessResult?.packages ?? {};
  const graphIndex = new PackageGraphIndex(graph);

  return findings.map((finding) => {
    const packageId = graphIndex.resolveFinding(finding)?.id
      ?? toPackageNodeId(finding.affectedPackage, finding.affectedVersion);
    const responsiveness = packages[packageId];
    if (!responsiveness) {
      return finding;
    }

    return {
      ...finding,
      evidenceData: {
        ...(finding.evidenceData ?? {}),
        ...responsiveness
      }
    };
  });
}
