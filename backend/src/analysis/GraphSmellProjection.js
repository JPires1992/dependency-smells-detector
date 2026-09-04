import { toPackageNodeId } from "../domain/PackageIdentifier.js";
import { PackageGraphIndex } from "./PackageGraphIndex.js";

/** Severity ordering used to keep only the highest smell rating on each graph node. */
const SEVERITY_RANK = Object.freeze({
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
});

/** Dependency context priority used when one package appears through different scopes. */
const DEPENDENCY_TYPE_RANK = Object.freeze({
  unknown: 0,
  root: 1,
  development: 2,
  production: 3
});

/** Builds a frontend graph containing only smelled packages and their immediate parents. */
export function projectSmellsOntoGraph(graph, scoredSmells) {
  const sourceGraph = graph ?? { nodes: [], edges: [] };
  const sourceGraphIndex = new PackageGraphIndex(sourceGraph);
  const projectedNodes = new Map();
  const projectedEdges = new Map();
  const smellsByPackageId = groupSmellsByPackageId(scoredSmells, sourceGraphIndex);

  for (const smell of scoredSmells) {
    const evidenceMetadata = getPackageEvidenceMetadata(smell);
    const smelledNode = upsertPackageNode(projectedNodes, sourceGraphIndex, {
      nodeId: smell.graphContext?.nodeId,
      name: smell.affectedPackage,
      version: smell.affectedVersion,
      depth: evidenceMetadata.depth,
      dependencyType: evidenceMetadata.dependencyType,
      synthetic: smell.graphContext?.synthetic === true
    });

    markSmellOnNode(smelledNode, smell);

    for (const parent of findImmediateParents(smell, sourceGraph, sourceGraphIndex)) {
      const parentNode = upsertPackageNode(projectedNodes, sourceGraphIndex, parent);
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

/** Infers whether an edge links the root directly or represents a transitive path. */
function inferEdgeRelationship(parentNode, smelledNode, evidenceMetadata) {
  if (parentNode.id === "root" || smelledNode.depth === 1 || evidenceMetadata.depth === 1) {
    return "direct";
  }

  return "transitive";
}

/** Groups scored smells by the graph node id of their affected package. */
function groupSmellsByPackageId(scoredSmells, sourceGraphIndex) {
  const grouped = new Map();

  for (const smell of scoredSmells) {
    const sourceNode = sourceGraphIndex.resolveFinding(smell);
    const id = sourceNode?.id
      ?? smell.graphContext?.nodeId
      ?? toPackageNodeId(smell.affectedPackage, smell.affectedVersion);
    const smells = grouped.get(id) ?? [];
    smells.push(smell);
    grouped.set(id, smells);
  }

  return grouped;
}

/** Adds or returns a package node from source graph metadata or normalized evidence. */
function upsertPackageNode(projectedNodes, sourceGraphIndex, packageRef) {
  const sourceNode = packageRef.synthetic
    ? null
    : sourceGraphIndex.resolve({
        nodeId: packageRef.nodeId ?? packageRef.id,
        name: packageRef.name,
        version: packageRef.version
      });
  const id = sourceNode?.id
    ?? packageRef.nodeId
    ?? packageRef.id
    ?? toPackageNodeId(packageRef.name, packageRef.version);
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

/** Merges normalized detector metadata into an existing projected node. */
function mergeNodeMetadata(node, packageRef) {
  const currentRank = dependencyTypeRank(node.dependencyType);
  const incomingRank = dependencyTypeRank(packageRef.dependencyType);

  if (incomingRank > currentRank) {
    node.dependencyType = packageRef.dependencyType;
    node.depth = packageRef.depth ?? node.depth;
    return;
  }

  if (
    incomingRank === currentRank
    && (node.depth == null || (packageRef.depth != null && packageRef.depth < node.depth))
  ) {
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
  if (
    !node.highestSeverity
    || SEVERITY_RANK[smell.score.finalRating] > SEVERITY_RANK[node.highestSeverity]
  ) {
    node.highestSeverity = smell.score.finalRating;
  }
}

/** Finds immediate parents from the source graph and normalized detector graph context. */
function findImmediateParents(smell, graph, graphIndex) {
  const explicitParents = findGraphContextParents(smell.graphContext, graphIndex);
  if (smell.graphContext?.synthetic === true) {
    return explicitParents;
  }

  const smelledId = graphIndex.resolveFinding(smell)?.id
    ?? smell.graphContext?.nodeId
    ?? toPackageNodeId(smell.affectedPackage, smell.affectedVersion);
  const graphParents = findGraphParents(smelledId, graph);
  return graphParents.length > 0
    ? mergeParentMetadata(graphParents, explicitParents)
    : explicitParents;
}

/** Resolves generic detector-provided parent references against the source graph. */
function findGraphContextParents(graphContext, graphIndex) {
  const parents = new Map();

  for (const parentRef of graphContext?.parentNodes ?? []) {
    const id = parentRef.id ?? toPackageNodeId(parentRef.name, parentRef.version);
    const sourceNode = graphIndex.resolve({
      nodeId: id,
      name: parentRef.name,
      version: parentRef.version
    });
    parents.set(id, {
      id,
      name: sourceNode?.name ?? parentRef.name,
      version: sourceNode?.version ?? parentRef.version ?? null,
      depth: sourceNode?.depth ?? parentRef.depth ?? null,
      dependencyType: chooseDependencyType(
        sourceNode?.dependencyType,
        parentRef.dependencyType
      )
    });
  }

  for (const nodeId of graphContext?.parentNodeIds ?? []) {
    const node = graphIndex.resolve({ nodeId });
    if (!node || parents.has(nodeId)) {
      continue;
    }
    parents.set(nodeId, {
      id: node.id,
      name: node.name,
      version: node.version,
      depth: node.depth,
      dependencyType: node.dependencyType
    });
  }

  return [...parents.values()];
}

/** Merges source-graph parents with normalized detector metadata when available. */
function mergeParentMetadata(graphParents, evidenceParents) {
  const evidenceById = new Map(evidenceParents.map((parent) => [
    toPackageNodeId(parent.name, parent.version),
    parent
  ]));

  return graphParents.map((parent) => {
    const evidence = evidenceById.get(toPackageNodeId(parent.name, parent.version));
    return {
      ...parent,
      depth: parent.depth ?? evidence?.depth,
      dependencyType:
        parent.dependencyType && parent.dependencyType !== "unknown"
          ? parent.dependencyType
          : evidence?.dependencyType
    };
  });
}

/** Reads immediate parents from the original dependency graph when it is available. */
function findGraphParents(smelledId, graph) {
  const nodeById = new Map((graph.nodes ?? []).map((node) => [node.id, node]));
  return (graph.edges ?? [])
    .filter((edge) => edge.target === smelledId)
    .map((edge) => nodeById.get(edge.source))
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      name: node.name,
      version: node.version,
      depth: node.depth,
      dependencyType: node.dependencyType
    }));
}

/** Reads normalized package metadata supplied by a detector adapter. */
function getPackageEvidenceMetadata(smell) {
  const graphContext = smell.graphContext;
  return {
    depth: graphContext?.depth ?? null,
    dependencyType: graphContext?.dependencyType ?? "unknown"
  };
}

/** Returns a numeric priority for dependency type comparisons. */
function dependencyTypeRank(dependencyType) {
  return DEPENDENCY_TYPE_RANK[dependencyType] ?? DEPENDENCY_TYPE_RANK.unknown;
}
