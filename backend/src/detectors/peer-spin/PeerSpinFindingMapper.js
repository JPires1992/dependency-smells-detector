import { SmellTypes } from "../../domain/SmellCatalog.js";

/** Detection source written to normalized findings produced by PeerSpin analysis. */
const DETECTION_SOURCE = "PeerSpinDetector";

/** Maps verified replacement conflicts to the common smell-finding contract. */
export class PeerSpinFindingMapper {
  /** Creates one finding with pattern, constraint, path, and registry evidence. */
  map(conflict, verification, model) {
    const affectedNode = conflict.peerSource;

    return {
      type: SmellTypes.PEER_DEPENDENCY_RESOLVING_LOOP,
      affectedPackage: affectedNode.name,
      affectedVersion: affectedNode.version,
      detectionSource: DETECTION_SOURCE,
      evidence: describeConflict(conflict, model),
      graphContext: { nodeId: affectedNode.id },
      evidenceData: {
        pattern: conflict.pattern,
        detectionTechnique: "Node-Replacement-Conflict pattern analysis",
        registryVerificationStatus: verification.status,
        registryPackagesChecked: verification.checkedPackages,
        peerSource: serializeNode(conflict.peerSource),
        peerEntry: serializeNode(conflict.peerEntry),
        conflictingPackage: conflict.conflictingPackage,
        requirements: conflict.requirements.map((requirement) =>
          serializeRequirement(requirement, model)
        ),
        dependencyPath: conflict.dependencyPath.map(serializeNode),
        replacementCycle: conflict.replacementCycle
      }
    };
  }
}

/** Produces concise human-readable evidence for each PeerSpin conflict pattern. */
function describeConflict(conflict, model) {
  if (conflict.pattern === "Peer-to-Regular") {
    const regular = conflict.requirements.find((requirement) => requirement.section);
    const peer = conflict.requirements.find((requirement) => !requirement.section);
    const peerRequester = model.nodesByPath.get(peer.sourcePath);
    return `${conflict.peerSource.id} introduces ${conflict.peerEntry.id} with regular range '${regular.range}', while ${peerRequester?.id ?? "a transitive package"} requires incompatible peer range '${peer.range}' for ${conflict.conflictingPackage}.`;
  }

  const [left, right] = conflict.requirements;
  const leftRequester = model.nodesByPath.get(left.sourcePath);
  const rightRequester = model.nodesByPath.get(right.sourcePath);
  return `${conflict.peerSource.id} introduces a peer set where ${leftRequester?.id ?? "one package"} requires ${conflict.conflictingPackage} '${left.range}' and ${rightRequester?.id ?? "another package"} requires incompatible range '${right.range}'.`;
}

/** Removes lockfile manifests from node evidence while retaining package identity and position. */
function serializeNode(node) {
  return {
    id: node.id,
    name: node.name,
    version: node.version,
    lockfilePath: node.path
  };
}

/** Serializes one regular or peer requirement with its declaring package. */
function serializeRequirement(requirement, model) {
  const sourceNode = model.nodesByPath.get(requirement.sourcePath);
  return {
    requiredBy: sourceNode?.id ?? "unknown",
    requiredPackage: requirement.targetName,
    requiredRange: requirement.range,
    dependencyKind: requirement.section ? "regular" : "peer",
    dependencySection: requirement.section ?? "peerDependencies"
  };
}
