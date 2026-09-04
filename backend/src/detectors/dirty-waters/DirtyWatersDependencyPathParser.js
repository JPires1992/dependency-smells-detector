import { parsePackageIdentifier, toPackageNodeId } from "../../domain/PackageIdentifier.js";

/** Priority used when the same package is reachable through multiple dependency scopes. */
const DEPENDENCY_TYPE_RANK = Object.freeze({
  unknown: 0,
  root: 1,
  development: 2,
  production: 3
});

/** Converts Dirty-Waters dependency-path markup into detector-independent graph context. */
export class DirtyWatersDependencyPathParser {
  /** Resolves affected-package metadata and immediate parents from all reported paths. */
  parse(parentEvidence, affectedPackage, rootDependencyTypesByName = {}) {
    if (!parentEvidence || !affectedPackage?.name) {
      return null;
    }

    const packageRefs = this.parsePackageRefs(parentEvidence, rootDependencyTypesByName);
    const affectedRefs = packageRefs.filter((packageRef) => matchesPackage(
      packageRef,
      affectedPackage
    ));
    const selected = affectedRefs.reduce(
      (best, packageRef) => choosePreferredPackageRef(best, packageRef),
      null
    );
    if (!selected) {
      return null;
    }

    return {
      nodeId: selected.id ?? toPackageNodeId(selected.name, selected.version),
      depth: selected.depth ?? null,
      dependencyType: selected.dependencyType ?? "unknown",
      parentNodes: findImmediateParents(packageRefs, affectedPackage)
    };
  }

  /** Parses package references while retaining path-derived depth and dependency scope. */
  parsePackageRefs(parentEvidence, rootDependencyTypesByName = {}) {
    const refs = [];
    const currentPathByDepth = new Map();
    const packageLinkPattern = /(?:^|<br>)([^[]*)\[([^\]]+)]\(https?:\/\/npmjs\.com\/package\/[^)]+\)/g;

    for (const match of String(parentEvidence).matchAll(packageLinkPattern)) {
      const packageRef = parsePackageIdentifier(match[2]);
      if (!packageRef.name) {
        continue;
      }

      const depth = inferDepthFromTreePrefix(match[1]);
      const normalizedRef = {
        ...packageRef,
        ...(depth === 0 ? { id: "root" } : {}),
        depth
      };

      if (depth != null) {
        currentPathByDepth.set(depth, normalizedRef);
        for (const knownDepth of [...currentPathByDepth.keys()]) {
          if (knownDepth > depth) {
            currentPathByDepth.delete(knownDepth);
          }
        }
      }

      normalizedRef.dependencyType = inferDependencyTypeFromPath(
        depth,
        currentPathByDepth,
        rootDependencyTypesByName
      );
      refs.push(normalizedRef);
    }

    return refs;
  }
}

/** Finds and deduplicates the nodes immediately preceding the affected package in each path. */
function findImmediateParents(packageRefs, affectedPackage) {
  const parents = new Map();

  for (let index = 1; index < packageRefs.length; index += 1) {
    if (!matchesPackage(packageRefs[index], affectedPackage)) {
      continue;
    }

    const parent = packageRefs[index - 1];
    const parentId = parent.id ?? toPackageNodeId(parent.name, parent.version);
    parents.set(parentId, choosePreferredPackageRef(parents.get(parentId), {
      ...parent,
      id: parentId
    }));
  }

  return [...parents.values()];
}

/** Matches package name and, when available, the exact affected version. */
function matchesPackage(packageRef, affectedPackage) {
  if (packageRef.name !== affectedPackage.name) {
    return false;
  }

  return !affectedPackage.version
    || !packageRef.version
    || packageRef.version === affectedPackage.version;
}

/** Selects production context first and the shortest path within the same scope. */
function choosePreferredPackageRef(existing, incoming) {
  if (!existing) {
    return { ...incoming };
  }

  const existingRank = dependencyTypeRank(existing.dependencyType);
  const incomingRank = dependencyTypeRank(incoming.dependencyType);
  if (incomingRank > existingRank) {
    return { ...incoming };
  }
  if (incomingRank < existingRank) {
    return existing;
  }
  if (existing.depth == null || (incoming.depth != null && incoming.depth < existing.depth)) {
    return { ...incoming };
  }

  return existing;
}

/** Returns a numeric priority for dependency-scope comparisons. */
function dependencyTypeRank(dependencyType) {
  return DEPENDENCY_TYPE_RANK[dependencyType] ?? DEPENDENCY_TYPE_RANK.unknown;
}

/** Infers dependency depth from Dirty-Waters tree indentation and connector variants. */
function inferDepthFromTreePrefix(prefix) {
  const preIndex = prefix.lastIndexOf("<pre>");
  const treePrefix = preIndex >= 0 ? prefix.slice(preIndex + 5) : prefix;
  const connectors = [
    "\u2514",
    "\u251c",
    "\u00e2\u201d\u201d",
    "\u00e2\u201d\u0153"
  ];
  const connectorIndex = Math.max(...connectors.map((connector) => treePrefix.lastIndexOf(connector)));
  if (connectorIndex >= 0) {
    return Math.floor(connectorIndex / 4);
  }

  const leadingSpaces = treePrefix.match(/^ */)?.[0]?.length ?? 0;
  return leadingSpaces === 0 ? 0 : Math.floor(leadingSpaces / 4);
}

/** Infers production/development from the first dependency below the path root. */
function inferDependencyTypeFromPath(depth, currentPathByDepth, rootDependencyTypesByName) {
  if (depth === null || depth === undefined) {
    return undefined;
  }
  if (depth === 0) {
    return "root";
  }

  const directDependencyName = currentPathByDepth.get(1)?.name;
  return rootDependencyTypesByName[directDependencyName] ?? "unknown";
}
