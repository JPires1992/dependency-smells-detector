import { parsePackageIdentifier, toPackageNodeId } from "../domain/PackageIdentifier.js";

/** Severity ordering used to keep only the highest smell rating on each graph node. */
const SEVERITY_RANK = Object.freeze({
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
});

/** Dependency context priority used when one package appears through production and development paths. */
const DEPENDENCY_TYPE_RANK = Object.freeze({
  unknown: 0,
  root: 1,
  development: 2,
  production: 3
});

/** Builds a frontend graph containing only smelled packages and their immediate parents. */
export function projectSmellsOntoGraph(graph, scoredSmells) {
  const sourceGraph = graph ?? { nodes: [], edges: [] };
  const sourceNodeById = new Map(sourceGraph.nodes.map((node) => [node.id, node]));
  const sourceNodeByName = new Map(sourceGraph.nodes.map((node) => [node.name, node]));
  const rootDependencyTypesByName = sourceGraph.rootDependencyTypesByName ?? {};
  const projectedNodes = new Map();
  const projectedEdges = new Map();
  const smellsByPackageId = groupSmellsByPackageId(scoredSmells);

  for (const smell of scoredSmells) {
    const evidenceMetadata = getPackageEvidenceMetadata(smell.evidenceData?.parent, {
      name: smell.affectedPackage,
      version: smell.affectedVersion
    }, rootDependencyTypesByName);
    const smelledNode = upsertPackageNode(projectedNodes, sourceNodeById, sourceNodeByName, {
      name: smell.affectedPackage,
      version: smell.affectedVersion,
      depth: evidenceMetadata.depth,
      dependencyType: evidenceMetadata.dependencyType
    });

    markSmellOnNode(smelledNode, smell);

    for (const parent of findImmediateParents(smell, sourceGraph, rootDependencyTypesByName)) {
      const parentNode = upsertPackageNode(projectedNodes, sourceNodeById, sourceNodeByName, parent);
      for (const parentSmell of smellsByPackageId.get(parentNode.id) ?? []) {
        markSmellOnNode(parentNode, parentSmell);
      }

      const edge = {
        source: parentNode.id,
        target: smelledNode.id,
        relationship: inferEdgeRelationship(parentNode, smelledNode, evidenceMetadata),
        smellIds: [smell.id]
      };
      const edgeKey = `${edge.source}->${edge.target}`;
      const existingEdge = projectedEdges.get(edgeKey);
      if (existingEdge) {
        existingEdge.smellIds = [...new Set([...existingEdge.smellIds, smell.id])];
      } else {
        projectedEdges.set(edgeKey, edge);
      }
    }
  }

  return {
    nodes: [...projectedNodes.values()],
    edges: [...projectedEdges.values()]
  };
}

/** Infers whether an edge links the root directly or represents a transitive dependency path. */
function inferEdgeRelationship(parentNode, smelledNode, evidenceMetadata) {
  if (parentNode.id === "root" || smelledNode.depth === 1 || evidenceMetadata.depth === 1) {
    return "direct";
  }

  return "transitive";
}

/** Groups scored smells by the graph node id of their affected package. */
function groupSmellsByPackageId(scoredSmells) {
  const grouped = new Map();

  for (const smell of scoredSmells) {
    const id = toPackageNodeId(smell.affectedPackage, smell.affectedVersion);
    const smells = grouped.get(id) ?? [];
    smells.push(smell);
    grouped.set(id, smells);
  }

  return grouped;
}

/** Adds or returns a package node from source graph metadata or smell evidence. */
function upsertPackageNode(projectedNodes, sourceNodeById, sourceNodeByName, packageRef) {
  const tentativeId = packageRef.id ?? toPackageNodeId(packageRef.name, packageRef.version);
  const sourceNode = sourceNodeById.get(tentativeId) ?? sourceNodeByName.get(packageRef.name);
  const id = sourceNode?.id === "root" ? "root" : tentativeId;
  const existing = projectedNodes.get(id);
  if (existing) {
    mergeNodeMetadata(existing, packageRef);
    return existing;
  }

  const node = {
    id,
    name: sourceNode?.name ?? packageRef.name,
    version: packageRef.version ?? sourceNode?.version ?? null,
    dependencyType: chooseDependencyType(sourceNode?.dependencyType, packageRef.dependencyType),
    depth: sourceNode?.depth ?? packageRef.depth ?? null,
    hasSmells: false,
    highestSeverity: null
  };

  projectedNodes.set(id, node);
  return node;
}

/** Merges evidence-derived metadata into an existing projected node. */
function mergeNodeMetadata(node, packageRef) {
  const currentRank = dependencyTypeRank(node.dependencyType);
  const incomingRank = dependencyTypeRank(packageRef.dependencyType);

  if (incomingRank > currentRank) {
    node.dependencyType = packageRef.dependencyType;
    node.depth = packageRef.depth ?? node.depth;
    return;
  }

  if (incomingRank === currentRank && (node.depth == null || (packageRef.depth != null && packageRef.depth < node.depth))) {
    node.depth = packageRef.depth;
  }
}

/** Chooses source graph dependency type unless it is absent or explicitly unknown. */
function chooseDependencyType(sourceDependencyType, evidenceDependencyType) {
  if (sourceDependencyType && sourceDependencyType !== "unknown") {
    return sourceDependencyType;
  }

  return evidenceDependencyType ?? "unknown";
}

/** Updates a graph node with smell severity metadata for frontend highlighting. */
function markSmellOnNode(node, smell) {
  node.hasSmells = true;
  if (!node.highestSeverity || SEVERITY_RANK[smell.score.finalRating] > SEVERITY_RANK[node.highestSeverity]) {
    node.highestSeverity = smell.score.finalRating;
  }
}

/** Finds immediate parent packages from graph edges first, then Dirty-Waters parent evidence. */
function findImmediateParents(smell, graph, rootDependencyTypesByName) {
  const smelledId = toPackageNodeId(smell.affectedPackage, smell.affectedVersion);
  const graphParents = findGraphParents(smelledId, graph);
  const evidenceParents = parseDirtyWatersImmediateParents(smell.evidenceData?.parent, {
    name: smell.affectedPackage,
    version: smell.affectedVersion
  }, rootDependencyTypesByName);
  if (graphParents.length > 0) {
    return mergeParentMetadata(graphParents, evidenceParents);
  }

  return evidenceParents;
}

/** Merges source graph parents with richer Dirty-Waters evidence metadata when available. */
function mergeParentMetadata(graphParents, evidenceParents) {
  const evidenceById = new Map(evidenceParents.map((parent) => [toPackageNodeId(parent.name, parent.version), parent]));

  return graphParents.map((parent) => ({
    ...parent,
    depth: parent.depth ?? evidenceById.get(toPackageNodeId(parent.name, parent.version))?.depth,
    dependencyType:
      parent.dependencyType && parent.dependencyType !== "unknown"
        ? parent.dependencyType
        : evidenceById.get(toPackageNodeId(parent.name, parent.version))?.dependencyType
  }));
}

/** Reads immediate parents from the original dependency graph when it is available. */
function findGraphParents(smelledId, graph) {
  const nodeById = new Map((graph.nodes ?? []).map((node) => [node.id, node]));
  return (graph.edges ?? [])
    .filter((edge) => edge.target === smelledId)
    .map((edge) => nodeById.get(edge.source))
    .filter(Boolean)
    .map((node) => ({ id: node.id, name: node.name, version: node.version, depth: node.depth, dependencyType: node.dependencyType }));
}

/** Parses Dirty-Waters HTML/Markdown path evidence and returns direct parents of a package. */
export function parseDirtyWatersImmediateParents(parentEvidence, affectedPackage, rootDependencyTypesByName = {}) {
  if (!parentEvidence || !affectedPackage?.name) {
    return [];
  }

  const packageRefs = parseDirtyWatersPackageRefs(parentEvidence, rootDependencyTypesByName);
  const parents = new Map();

  for (let index = 1; index < packageRefs.length; index += 1) {
    const current = packageRefs[index];
    if (current.name !== affectedPackage.name) {
      continue;
    }

    if (affectedPackage.version && current.version && current.version !== affectedPackage.version) {
      continue;
    }

    const parent = packageRefs[index - 1];
    const parentId = toPackageNodeId(parent.name, parent.version);
    parents.set(parentId, choosePreferredPackageRef(parents.get(parentId), parent));
  }

  return [...parents.values()];
}

/** Parses all package references from Dirty-Waters path evidence with inferred depth. */
export function parseDirtyWatersPackageRefs(parentEvidence, rootDependencyTypesByName = {}) {
  const refs = [];
  const currentPathByDepth = new Map();

  for (const match of String(parentEvidence).matchAll(/(?:^|<br>)([^[]*)\[([^\]]+)]\(https?:\/\/npmjs\.com\/package\/[^)]+\)/g)) {
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

    normalizedRef.dependencyType = inferDependencyTypeFromPath(depth, currentPathByDepth, rootDependencyTypesByName);
    refs.push(normalizedRef);
  }

  return refs;
}

/** Finds the best depth/type metadata for a package from Dirty-Waters evidence. */
function getPackageEvidenceMetadata(parentEvidence, affectedPackage, rootDependencyTypesByName) {
  const packageRefs = parseDirtyWatersPackageRefs(parentEvidence, rootDependencyTypesByName);
  const matches = packageRefs.filter((packageRef) => {
    if (packageRef.name !== affectedPackage.name) {
      return false;
    }

    return !affectedPackage.version || !packageRef.version || packageRef.version === affectedPackage.version;
  });
  const selected = matches.reduce((best, packageRef) => choosePreferredPackageRef(best, packageRef), null);

  return {
    depth: selected?.depth ?? null,
    dependencyType: selected?.dependencyType ?? "unknown"
  };
}

/** Selects the package metadata that best represents remediation priority. */
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

/** Returns a numeric priority for dependency type comparisons. */
function dependencyTypeRank(dependencyType) {
  return DEPENDENCY_TYPE_RANK[dependencyType] ?? DEPENDENCY_TYPE_RANK.unknown;
}

/** Infers dependency depth from the indentation prefix generated by Dirty-Waters tree output. */
function inferDepthFromTreePrefix(prefix) {
  const preIndex = prefix.lastIndexOf("<pre>");
  const treePrefix = preIndex >= 0 ? prefix.slice(preIndex + 5) : prefix;
  const connectorIndex = Math.max(treePrefix.lastIndexOf("└"), treePrefix.lastIndexOf("├"));
  if (connectorIndex >= 0) {
    return Math.floor(connectorIndex / 4);
  }

  const leadingSpaces = treePrefix.match(/^ */)?.[0]?.length ?? 0;
  if (leadingSpaces === 0) {
    return 0;
  }

  return Math.floor(leadingSpaces / 4);
}

/** Infers production/development from the first dependency below root in a Dirty-Waters path. */
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
