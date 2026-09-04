/** Indexes graph nodes and resolves package references without arbitrary name fallbacks. */
export class PackageGraphIndex {
  /** Builds immutable lookup indexes for node ids, package names, and direct dependencies. */
  constructor(graph = {}) {
    this.nodesById = new Map();
    this.nodesByName = new Map();
    this.directNodeIds = new Set();

    for (const node of graph.nodes ?? []) {
      if (!node?.id) {
        continue;
      }

      this.nodesById.set(node.id, node);
      const namedNodes = this.nodesByName.get(node.name) ?? [];
      namedNodes.push(node);
      this.nodesByName.set(node.name, namedNodes);
    }

    for (const edge of graph.edges ?? []) {
      if (edge?.source === "root" && this.nodesById.has(edge.target)) {
        this.directNodeIds.add(edge.target);
      }
    }
  }

  /** Resolves an explicit node id before requiring a unique name and version match. */
  resolve({ nodeId = null, name = null, version = null } = {}) {
    if (nodeId && this.nodesById.has(nodeId)) {
      return this.nodesById.get(nodeId);
    }

    if (!name) {
      return null;
    }

    const candidates = (this.nodesByName.get(name) ?? []).filter((node) =>
      version == null || String(node.version) === String(version)
    );
    return selectUniqueNode(candidates);
  }

  /** Resolves a finding through its internal node id or public package coordinates. */
  resolveFinding(finding = {}) {
    return this.resolve({
      nodeId: finding.graphContext?.nodeId,
      name: finding.affectedPackage,
      version: finding.affectedVersion
    });
  }

  /** Resolves a direct dependency only when one root edge identifies it unambiguously. */
  resolveDirectDependency(name) {
    if (!name) {
      return null;
    }

    const candidates = (this.nodesByName.get(name) ?? []).filter((node) =>
      this.directNodeIds.has(node.id)
    );
    return selectUniqueNode(candidates);
  }
}

/** Returns a node only when all matching references identify one graph node. */
function selectUniqueNode(candidates) {
  const uniqueById = new Map(candidates.map((node) => [node.id, node]));
  return uniqueById.size === 1 ? [...uniqueById.values()][0] : null;
}
