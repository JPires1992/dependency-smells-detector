import semver from "semver";
import { peerPlacementPath } from "./PeerDependencyModelBuilder.js";
import { requirePositiveInteger } from "../../utils/ConfigurationValue.js";

/** Detects the two minimal PeerSpin patterns through repeated replacement conflicts. */
export class NodeReplacementConflictDetector {
  /** Configures a hard traversal limit for malformed or unexpectedly large lock graphs. */
  constructor({ maxTraversalNodes } = {}) {
    this.maxTraversalNodes = requirePositiveInteger(
      maxTraversalNodes,
      "peerSpin.maxTraversalNodes"
    );
  }

  /** Returns verified-by-model replacement candidates and bounded-analysis diagnostics. */
  detect(model) {
    const conflictsByKey = new Map();
    let invalidRangeComparisons = 0;
    let truncatedTraversals = 0;

    for (const regularRequirement of model?.regularEdges ?? []) {
      const peerSource = model.nodesByPath.get(regularRequirement.sourcePath);
      const peerEntry = model.nodesByPath.get(regularRequirement.targetPath);
      if (!peerSource || !peerEntry) {
        continue;
      }

      const closure = collectRegularClosure(
        peerEntry.path,
        model.regularEdgesBySource,
        this.maxTraversalNodes
      );
      if (closure.truncated) {
        truncatedTraversals += 1;
        continue;
      }

      for (const [requesterPath, dependencyPath] of closure.pathsByNode) {
        for (const peerRequirement of model.peerRequirementsBySource.get(requesterPath) ?? []) {
          if (peerRequirement.optional || peerRequirement.targetName !== peerEntry.name) {
            continue;
          }

          if (
            peerRequirement.providerPath
            && peerRequirement.providerPath !== peerEntry.path
          ) {
            continue;
          }

          const comparison = compareRanges(
            regularRequirement.range,
            peerRequirement.range
          );
          if (comparison === null) {
            invalidRangeComparisons += 1;
          } else if (comparison === false) {
            const conflict = createPeerToRegularConflict({
              peerSource,
              peerEntry,
              regularRequirement,
              peerRequirement,
              dependencyPath,
              model
            });
            conflictsByKey.set(conflict.key, conflict);
          }
        }
      }

      const peerSet = collectPeerSet(peerEntry.path, model, this.maxTraversalNodes);
      if (peerSet.truncated) {
        truncatedTraversals += 1;
        continue;
      }

      for (const requirements of groupByTargetName(peerSet.requirements).values()) {
        for (let leftIndex = 0; leftIndex < requirements.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < requirements.length; rightIndex += 1) {
            const left = requirements[leftIndex];
            const right = requirements[rightIndex];
            if (left.sourcePath === right.sourcePath) {
              continue;
            }

            if (
              left.providerPath
              && right.providerPath
              && left.providerPath !== right.providerPath
            ) {
              continue;
            }

            const comparison = compareRanges(left.range, right.range);
            if (comparison === null) {
              invalidRangeComparisons += 1;
            } else if (comparison === false) {
              const conflict = createPeerToPeerConflict({
                peerSource,
                peerEntry,
                regularRequirement,
                left,
                right,
                model
              });
              conflictsByKey.set(conflict.key, conflict);
            }
          }
        }
      }
    }

    return {
      conflicts: [...conflictsByKey.values()],
      warnings: buildWarnings({ invalidRangeComparisons, truncatedTraversals })
    };
  }
}

/** Collects regular descendants and their path from one candidate peer entry. */
function collectRegularClosure(entryPath, regularEdgesBySource, maxTraversalNodes) {
  const pathsByNode = new Map([[entryPath, [entryPath]]]);
  const queue = [entryPath];

  while (queue.length > 0) {
    const sourcePath = queue.shift();
    for (const edge of regularEdgesBySource.get(sourcePath) ?? []) {
      if (pathsByNode.has(edge.targetPath)) {
        continue;
      }

      if (pathsByNode.size >= maxTraversalNodes) {
        return { pathsByNode, truncated: true };
      }

      pathsByNode.set(edge.targetPath, [...pathsByNode.get(sourcePath), edge.targetPath]);
      queue.push(edge.targetPath);
    }
  }

  return { pathsByNode, truncated: false };
}

/** Traverses providers in a peer set while retaining every declared peer constraint. */
function collectPeerSet(entryPath, model, maxTraversalNodes) {
  const requirements = [];
  const visitedPaths = new Set([entryPath]);
  const queue = [entryPath];

  while (queue.length > 0) {
    const sourcePath = queue.shift();
    for (const requirement of model.peerRequirementsBySource.get(sourcePath) ?? []) {
      if (requirement.optional) {
        continue;
      }

      requirements.push(requirement);
      if (!requirement.providerPath || visitedPaths.has(requirement.providerPath)) {
        continue;
      }

      if (visitedPaths.size >= maxTraversalNodes) {
        return { requirements, truncated: true };
      }

      visitedPaths.add(requirement.providerPath);
      queue.push(requirement.providerPath);
    }
  }

  return { requirements, truncated: false };
}

/** Returns true for intersecting SemVer ranges, false for conflicts, and null for unsupported ranges. */
function compareRanges(leftRange, rightRange) {
  const normalizedLeft = semver.validRange(leftRange, { includePrerelease: true });
  const normalizedRight = semver.validRange(rightRange, { includePrerelease: true });
  if (!normalizedLeft || !normalizedRight) {
    return null;
  }

  return semver.intersects(normalizedLeft, normalizedRight, { includePrerelease: true });
}

/** Creates a Peer-to-Regular replacement cycle from incompatible regular and peer ranges. */
function createPeerToRegularConflict({
  peerSource,
  peerEntry,
  regularRequirement,
  peerRequirement,
  dependencyPath,
  model
}) {
  const requester = model.nodesByPath.get(peerRequirement.sourcePath);
  const position = peerEntry.path;
  const requirements = [regularRequirement, peerRequirement];

  return {
    key: [
      "Peer-to-Regular",
      peerSource.path,
      peerEntry.path,
      peerRequirement.sourcePath,
      peerEntry.name
    ].join("|"),
    pattern: "Peer-to-Regular",
    peerSource,
    peerEntry,
    conflictingPackage: peerEntry.name,
    requirements,
    verificationRequirements: requirements,
    involvedNodes: compactNodes([peerSource, peerEntry, requester]),
    dependencyPath: dependencyPath.map((nodePath) => model.nodesByPath.get(nodePath)).filter(Boolean),
    replacementCycle: createReplacementCycle(position, requirements, model)
  };
}

/** Creates a Peer-to-Peer replacement cycle from incompatible peer requirements. */
function createPeerToPeerConflict({
  peerSource,
  peerEntry,
  regularRequirement,
  left,
  right,
  model
}) {
  const leftRequester = model.nodesByPath.get(left.sourcePath);
  const rightRequester = model.nodesByPath.get(right.sourcePath);
  const position = left.providerPath
    || right.providerPath
    || peerPlacementPath(peerEntry.path, left.targetName);
  const requirements = [left, right];

  return {
    key: [
      "Peer-to-Peer",
      peerSource.path,
      peerEntry.path,
      left.targetName,
      ...[left.sourcePath, right.sourcePath].sort()
    ].join("|"),
    pattern: "Peer-to-Peer",
    peerSource,
    peerEntry,
    conflictingPackage: left.targetName,
    requirements,
    introducingRequirement: regularRequirement,
    verificationRequirements: [regularRequirement, ...requirements],
    involvedNodes: compactNodes([
      peerSource,
      peerEntry,
      leftRequester,
      rightRequester
    ]),
    dependencyPath: [peerEntry],
    replacementCycle: createReplacementCycle(position, requirements, model)
  };
}

/** Represents the repeated placement sequence used as Node-Replacement-Conflict evidence. */
function createReplacementCycle(position, requirements, model) {
  const [left, right] = requirements;
  return [left, right, left].map((requirement) => ({
    position,
    requiredBy: model.nodesByPath.get(requirement.sourcePath)?.id ?? "unknown",
    dependencyKind: requirement.section ? "regular" : "peer",
    requiredRange: requirement.range
  }));
}

/** Groups peer requirements by the package whose provider may be repeatedly replaced. */
function groupByTargetName(requirements) {
  const grouped = new Map();

  for (const requirement of requirements) {
    const values = grouped.get(requirement.targetName) ?? [];
    values.push(requirement);
    grouped.set(requirement.targetName, values);
  }

  return grouped;
}

/** Deduplicates involved package records by their physical lockfile path. */
function compactNodes(nodes) {
  return [...new Map(nodes.filter(Boolean).map((node) => [node.path, node])).values()];
}

/** Converts skipped comparisons and traversals into concise detector diagnostics. */
function buildWarnings({ invalidRangeComparisons, truncatedTraversals }) {
  const warnings = [];
  if (invalidRangeComparisons > 0) {
    warnings.push(
      `PeerSpin analysis skipped ${invalidRangeComparisons} comparisons with non-SemVer constraints.`
    );
  }
  if (truncatedTraversals > 0) {
    warnings.push(
      `PeerSpin analysis truncated ${truncatedTraversals} dependency traversals at the configured safety limit.`
    );
  }
  return warnings;
}
