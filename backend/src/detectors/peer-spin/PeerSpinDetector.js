import { NpmRegistryMetadataProvider } from "./NpmRegistryMetadataProvider.js";
import { NodeReplacementConflictDetector } from "./NodeReplacementConflictDetector.js";
import { PeerDependencyModelBuilder } from "./PeerDependencyModelBuilder.js";
import { PeerSpinFindingMapper } from "./PeerSpinFindingMapper.js";
import { PeerSpinRegistryVerifier } from "./PeerSpinRegistryVerifier.js";

/** Default maximum number of registry-verified PeerSpin conflicts emitted per analysis. */
const DEFAULT_MAX_CONFLICTS = 100;
const DEFAULT_VERIFICATION_CONCURRENCY = 4;

/** Coordinates lockfile modeling, replacement detection, registry verification, and mapping. */
export class PeerSpinDetector {
  /** Configures independently replaceable PeerSpin analysis modules and safety limits. */
  constructor({
    modelBuilder = new PeerDependencyModelBuilder(),
    conflictDetector = new NodeReplacementConflictDetector(),
    metadataProvider = new NpmRegistryMetadataProvider(),
    registryVerifier = null,
    findingMapper = new PeerSpinFindingMapper(),
    maxConflicts = readPositiveInteger(
      process.env.PEER_SPIN_MAX_CONFLICTS,
      DEFAULT_MAX_CONFLICTS
    ),
    verificationConcurrency = readPositiveInteger(
      process.env.PEER_SPIN_REGISTRY_CONCURRENCY,
      DEFAULT_VERIFICATION_CONCURRENCY
    ),
    required = false
  } = {}) {
    this.name = "PeerSpinDetector";
    this.modelBuilder = modelBuilder;
    this.conflictDetector = conflictDetector;
    this.registryVerifier = registryVerifier
      ?? new PeerSpinRegistryVerifier({ metadataProvider });
    this.findingMapper = findingMapper;
    this.maxConflicts = maxConflicts;
    this.verificationConcurrency = verificationConcurrency;
    this.required = required;
  }

  /** Detects registry-confirmed PeerSpin patterns in the exact analysed npm lockfile. */
  async detect(context) {
    if (context.project?.packageManager !== "npm") {
      return this.#handleUnavailable(
        "PeerSpin analysis was skipped because the project is not using npm."
      );
    }

    if (context.manifests?.lockfileStatus !== "present" || !context.manifests?.packageLock) {
      return this.#handleUnavailable(
        "PeerSpin analysis was skipped because a readable npm lockfile is required."
      );
    }

    const modelResult = this.modelBuilder.build({
      packageLock: context.manifests.packageLock,
      packageJson: context.manifests.packageJson
    });
    if (!modelResult.model) {
      if (this.required) {
        throw new Error(modelResult.warnings.join(" "));
      }
      return { findings: [], warnings: modelResult.warnings };
    }

    const detectionResult = this.conflictDetector.detect(modelResult.model);
    const warnings = [
      ...(modelResult.warnings ?? []),
      ...(detectionResult.warnings ?? [])
    ];
    const candidates = detectionResult.conflicts.slice(0, this.maxConflicts);
    if (detectionResult.conflicts.length > this.maxConflicts) {
      warnings.push(
        `PeerSpin verification was limited to ${this.maxConflicts} of ${detectionResult.conflicts.length} candidates.`
      );
    }

    const verifications = await mapWithConcurrency(
      candidates,
      this.verificationConcurrency,
      (candidate) => this.registryVerifier.verify(candidate, modelResult.model)
    );
    const findings = [];
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      const verification = verifications[index];
      if (!verification.verified) {
        if (this.required && verification.status === "unavailable") {
          throw new Error(
            `PeerSpin candidate ${candidate.peerSource.id}/${candidate.pattern} could not be verified: ${verification.reason}`
          );
        }
        warnings.push(
          `PeerSpin candidate ${candidate.peerSource.id}/${candidate.pattern} was not emitted: ${verification.reason}`
        );
        continue;
      }

      findings.push(this.findingMapper.map(candidate, verification, modelResult.model));
    }

    return { findings, warnings };
  }

  /** Converts unavailable prerequisites to warnings or errors according to detector policy. */
  #handleUnavailable(message) {
    if (this.required) {
      throw new Error(message);
    }

    return { findings: [], warnings: [message] };
  }
}

/** Maps asynchronous verification work with a fixed number of concurrent workers. */
async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  /** Claims and processes items until the shared queue is exhausted. */
  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

/** Reads a positive integer detector limit while preserving a deterministic fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
