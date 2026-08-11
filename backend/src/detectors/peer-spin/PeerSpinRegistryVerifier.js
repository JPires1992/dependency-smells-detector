import semver from "semver";

/** Confirms lockfile-derived PeerSpin constraints against exact npm registry manifests. */
export class PeerSpinRegistryVerifier {
  /** Configures the exact-version metadata provider used for canonical declarations. */
  constructor({ metadataProvider } = {}) {
    if (!metadataProvider) {
      throw new Error("PeerSpinRegistryVerifier requires an npm metadata provider.");
    }
    this.metadataProvider = metadataProvider;
  }

  /** Verifies every regular and peer requirement participating in one replacement cycle. */
  async verify(conflict, model) {
    const checkedPackages = new Map();

    try {
      for (const requirement of conflict.verificationRequirements ?? conflict.requirements ?? []) {
        const sourceNode = model.nodesByPath.get(requirement.sourcePath);
        if (!sourceNode) {
          return unavailableVerification("A requirement source node was absent from the lock model.");
        }

        const manifest = sourceNode.path === ""
          ? model.rootManifest
          : await this.metadataProvider.getVersionManifest(sourceNode.name, sourceNode.version);
        const actualRange = readDeclaredRange(manifest, requirement);
        if (!rangesEquivalent(actualRange, requirement.range)) {
          return {
            status: "mismatch",
            verified: false,
            reason: `${sourceNode.id} no longer declares ${requirement.targetName} with range '${requirement.range}'.`,
            checkedPackages: [...checkedPackages.values()]
          };
        }

        checkedPackages.set(sourceNode.id, {
          name: sourceNode.name,
          version: sourceNode.version,
          source: sourceNode.path === "" ? "repository" : "npm registry"
        });
      }
    } catch (error) {
      return unavailableVerification(error.message, [...checkedPackages.values()]);
    }

    return {
      status: "verified",
      verified: true,
      reason: null,
      checkedPackages: [...checkedPackages.values()]
    };
  }
}

/** Reads a declaration from its exact dependency section and relationship kind. */
function readDeclaredRange(manifest, requirement) {
  if (requirement.section) {
    return manifest?.[requirement.section]?.[requirement.targetName] ?? null;
  }

  return manifest?.peerDependencies?.[requirement.targetName] ?? null;
}

/** Compares SemVer ranges semantically while preserving exact comparison for other specifiers. */
function rangesEquivalent(actualRange, expectedRange) {
  if (actualRange == null) {
    return false;
  }

  const normalizedActual = semver.validRange(String(actualRange), { includePrerelease: true });
  const normalizedExpected = semver.validRange(String(expectedRange), { includePrerelease: true });
  if (normalizedActual && normalizedExpected) {
    return normalizedActual === normalizedExpected;
  }

  return String(actualRange).trim() === String(expectedRange).trim();
}

/** Builds a stable incomplete-verification result without throwing from an optional detector. */
function unavailableVerification(reason, checkedPackages = []) {
  return {
    status: "unavailable",
    verified: false,
    reason,
    checkedPackages
  };
}
