import { SmellTypes } from "../../domain/smellCatalog.js";
import { parsePackageIdentifier } from "../../domain/packageIdentifier.js";

/** Converts Dirty-Waters static JSON output into normalized smell findings. */
export class DirtyWatersOutputParser {
  /** Parses all package entries from a Dirty-Waters static results file. */
  parseStaticResults(staticResults, { rawResultPath = null, markdownReportPath = null } = {}) {
    const findings = [];

    for (const [packageIdentifier, packageData] of Object.entries(staticResults ?? {})) {
      const { name, version } = parsePackageIdentifier(packageIdentifier);
      const common = {
        affectedPackage: name,
        affectedVersion: version,
        detectionSource: "Dirty-Waters",
        rawResultPath,
        markdownReportPath,
        rawPackageIdentifier: packageIdentifier
      };

      findings.push(...this.#findSourceCodeSmells(common, packageData));
      findings.push(...this.#findReleaseTraceabilitySmells(common, packageData));
      findings.push(...this.#findPackageMetadataSmells(common, packageData));
      findings.push(...this.#findCodeSignatureSmells(common, packageData));
      findings.push(...this.#findAliasingSmells(common, packageData));
    }

    return findings;
  }

  /** Maps missing or inaccessible source repository evidence to source-code smells. */
  #findSourceCodeSmells(common, packageData) {
    const sourceCode = packageData?.source_code ?? {};
    const githubUrl = sourceCode.github_url;
    const findings = [];

    if (githubUrl === "No_repo_info_found" || githubUrl === null || githubUrl === undefined) {
      findings.push(createFinding(common, SmellTypes.NO_SOURCE_CODE_URL, "Package metadata does not expose a source code repository URL.", {
        githubUrl,
        parent: packageData?.parent,
        command: packageData?.command
      }));
    } else if (sourceCode.github_exists === false) {
      findings.push(createFinding(common, SmellTypes.INVALID_SOURCE_CODE_URL, "Package source code repository URL is unavailable or returned a not-found response.", {
        githubUrl,
        githubExists: sourceCode.github_exists,
        parent: packageData?.parent,
        command: packageData?.command
      }));
    }

    return findings;
  }

  /** Maps missing commit SHA or release tag evidence to traceability smells. */
  #findReleaseTraceabilitySmells(common, packageData) {
    const sourceCode = packageData?.source_code ?? {};
    const versionInfo = sourceCode.source_code_version ?? {};

    if (sourceCode.github_exists === true && versionInfo.exists === false) {
      return [
        createFinding(common, SmellTypes.INACCESSIBLE_COMMIT_SHA_OR_RELEASE_TAG, "The package release could not be traced to an accessible commit SHA or release tag.", {
          githubUrl: sourceCode.github_url,
          tagUrl: versionInfo.tag_url,
          shaUrl: versionInfo.sha_url,
          tagRelatedInfo: versionInfo.tag_related_info,
          parent: packageData?.parent,
          command: packageData?.command
        })
      ];
    }

    return [];
  }

  /** Maps registry and repository metadata fields to package metadata smells. */
  #findPackageMetadataSmells(common, packageData) {
    const findings = [];
    const packageInfo = packageData?.package_info ?? {};
    const sourceCode = packageData?.source_code ?? {};

    if (packageInfo.deprecated_in_version === true) {
      findings.push(createFinding(common, SmellTypes.DEPRECATED, "Package version is marked as deprecated in registry metadata.", {
        allDeprecated: packageInfo.all_deprecated,
        deprecatedInVersion: packageInfo.deprecated_in_version,
        parent: packageData?.parent
      }));
    }

    if (sourceCode.is_fork === true) {
      findings.push(createFinding(common, SmellTypes.FORK, "Package source repository is detected as a fork.", {
        githubUrl: sourceCode.github_url,
        parentRepoLink: sourceCode.parent_repo_link,
        parent: packageData?.parent,
        command: packageData?.command
      }));
    }

    if (packageInfo.provenance_in_version === false) {
      findings.push(createFinding(common, SmellTypes.NO_PROVENANCE, "Package version does not expose build provenance or attestation metadata.", {
        provenanceInVersion: packageInfo.provenance_in_version,
        parent: packageData?.parent
      }));
    }

    return findings;
  }

  /** Maps code signature fields to missing or invalid signature smells. */
  #findCodeSignatureSmells(common, packageData) {
    const codeSignature = packageData?.code_signature ?? {};

    if (codeSignature.signature_present === false) {
      return [
        createFinding(common, SmellTypes.NO_CODE_SIGNATURE, "Package does not expose a code signature.", {
          signaturePresent: codeSignature.signature_present,
          signatureValid: codeSignature.signature_valid,
          parent: packageData?.parent,
          command: packageData?.command
        })
      ];
    }

    if (codeSignature.signature_present === true && codeSignature.signature_valid === false) {
      return [
        createFinding(common, SmellTypes.INVALID_CODE_SIGNATURE, "Package exposes a code signature that Dirty-Waters reported as invalid.", {
          signaturePresent: codeSignature.signature_present,
          signatureValid: codeSignature.signature_valid,
          parent: packageData?.parent,
          command: packageData?.command
        })
      ];
    }

    return [];
  }

  /** Maps alias metadata to dependency alias smells when available. */
  #findAliasingSmells(common, packageData) {
    const aliasedName =
      packageData?.aliased_package_name ??
      packageData?.aliasedPackageName ??
      packageData?.alias ??
      null;

    if (packageData?.is_aliased === true || aliasedName) {
      return [
        createFinding(common, SmellTypes.ALIASED, "Package is installed through a dependency alias.", {
          aliasedPackageName: aliasedName
        })
      ];
    }

    return [];
  }
}

/** Builds a detector-independent smell finding from parsed Dirty-Waters evidence. */
function createFinding(common, smellType, evidence, evidenceData) {
  return {
    type: smellType,
    affectedPackage: common.affectedPackage,
    affectedVersion: common.affectedVersion,
    detectionSource: common.detectionSource,
    evidence,
    evidenceData: removeUndefinedValues({
      ...evidenceData,
      rawResultPath: common.rawResultPath,
      markdownReportPath: common.markdownReportPath,
      rawPackageIdentifier: common.rawPackageIdentifier
    })
  };
}

/** Removes undefined values before evidence is exported to JSON and Markdown. */
function removeUndefinedValues(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));
}
