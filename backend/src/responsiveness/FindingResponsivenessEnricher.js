import { toPackageNodeId } from "../domain/PackageIdentifier.js";

/** Adds normalized package responsiveness evidence before SSSS scoring. */
export function enrichFindingsWithResponsiveness(findings, responsivenessResult) {
  const packages = responsivenessResult?.packages ?? {};

  return findings.map((finding) => {
    const packageId = toPackageNodeId(finding.affectedPackage, finding.affectedVersion);
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
