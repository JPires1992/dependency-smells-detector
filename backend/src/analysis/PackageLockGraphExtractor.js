import { readFile } from "node:fs/promises";
import path from "node:path";
import { parsePackageIdentifier, toPackageNodeId } from "../domain/PackageIdentifier.js";

/** Extracts a dependency graph from npm package-lock.json files. */
export class PackageLockGraphExtractor {
  /** Reads the lockfile and returns normalized graph nodes and edges. */
  async extract(projectDirectory, packageJson = {}) {
    const lockfilePath = path.join(projectDirectory, "package-lock.json");
    const lockfile = JSON.parse(await readFile(lockfilePath, "utf8"));
    return this.extractLockfile(lockfile, packageJson);
  }

  /** Converts a parsed package-lock.json document into normalized graph nodes and edges. */
  extractLockfile(lockfile, packageJson = {}) {
    if (lockfile.packages && typeof lockfile.packages === "object") {
      return this.#extractFromPackagesObject(lockfile, packageJson);
    }

    if (lockfile.dependencies && typeof lockfile.dependencies === "object") {
      return this.#extractFromLegacyDependencies(lockfile, packageJson);
    }

    return createRootOnlyGraph(packageJson);
  }

  /** Extracts graph data from lockfileVersion 2/3 package maps. */
  #extractFromPackagesObject(lockfile, packageJson) {
    const nodesByPath = new Map();
    const nodes = [];
    const edges = [];
    const packages = lockfile.packages;
    const rootPackage = packages[""] ?? {};
    const rootName = packageJson.name || lockfile.name || rootPackage.name || "root";
    const rootNode = createRootNode(rootName, packageJson.version || lockfile.version || rootPackage.version || null);

    nodesByPath.set("", rootNode);
    nodes.push(rootNode);

    const rootProductionDeps = packageDependencyNames(rootPackage, packageJson, ["dependencies", "optionalDependencies", "peerDependencies"]);
    const rootDevDeps = packageDependencyNames(rootPackage, packageJson, ["devDependencies"]);
    const productionEntryIds = new Set();
    const developmentEntryIds = new Set();

    for (const [packagePath, packageInfo] of Object.entries(packages)) {
      if (!packagePath) {
        continue;
      }

      const packageName = packageInfo.name || inferPackageNameFromLockPath(packagePath);
      const version = packageInfo.version || null;
      const depth = countPackageDepth(packagePath);
      const dependencyType = inferDependencyType(packageName, packageInfo, rootProductionDeps, rootDevDeps);
      const node = {
        id: toPackageNodeId(packageName, version),
        name: packageName,
        version,
        dependencyType,
        depth,
        hasSmells: false,
        highestSeverity: null
      };

      nodesByPath.set(packagePath, node);
      nodes.push(node);
    }

    for (const depName of rootProductionDeps) {
      const targetPath = findDependencyPackagePath("", depName, packages);
      if (targetPath && nodesByPath.has(targetPath)) {
        const targetId = nodesByPath.get(targetPath).id;
        productionEntryIds.add(targetId);
        edges.push({ source: rootNode.id, target: targetId, relationship: "direct" });
      }
    }

    for (const depName of rootDevDeps) {
      const targetPath = findDependencyPackagePath("", depName, packages);
      if (targetPath && nodesByPath.has(targetPath)) {
        const targetId = nodesByPath.get(targetPath).id;
        developmentEntryIds.add(targetId);
        edges.push({ source: rootNode.id, target: targetId, relationship: "direct" });
      }
    }

    for (const [packagePath, packageInfo] of Object.entries(packages)) {
      if (!packagePath) {
        continue;
      }

      const sourceNode = nodesByPath.get(packagePath);
      if (!sourceNode) {
        continue;
      }

      for (const depName of dependencyNamesFromPackageInfo(packageInfo)) {
        const targetPath = findDependencyPackagePath(packagePath, depName, packages);
        if (!targetPath || !nodesByPath.has(targetPath)) {
          continue;
        }

        edges.push({
          source: sourceNode.id,
          target: nodesByPath.get(targetPath).id,
          relationship: "transitive"
        });
      }
    }

    return applyDependencyScopes(
      applyGraphDepths(deduplicateGraph({ nodes, edges })),
      productionEntryIds,
      developmentEntryIds
    );
  }

  /** Extracts graph data from legacy package-lock dependency trees. */
  #extractFromLegacyDependencies(lockfile, packageJson) {
    const rootName = packageJson.name || lockfile.name || "root";
    const rootNode = createRootNode(rootName, packageJson.version || lockfile.version || null);
    const nodes = [rootNode];
    const edges = [];
    const rootProductionDeps = packageDependencyNames({}, packageJson, ["dependencies", "optionalDependencies", "peerDependencies"]);
    const rootDevDeps = new Set(Object.keys(packageJson.devDependencies ?? {}));

    const visit = (deps, parentId, depth) => {
      for (const [name, data] of Object.entries(deps ?? {})) {
        const version = data.version || null;
        const id = toPackageNodeId(name, version);
        const dependencyType = rootDevDeps.has(name) || data.dev ? "development" : "production";

        nodes.push({
          id,
          name,
          version,
          dependencyType,
          depth,
          hasSmells: false,
          highestSeverity: null
        });
        edges.push({
          source: parentId,
          target: id,
          relationship: depth === 1 && rootProductionDeps.has(name) ? "direct" : "transitive"
        });

        visit(mergeDependencyMaps(data, ["dependencies", "optionalDependencies", "peerDependencies"]), id, depth + 1);
      }
    };

    visit(mergeDependencyMaps(lockfile, ["dependencies", "optionalDependencies", "peerDependencies"]), rootNode.id, 1);
    return applyGraphDepths(deduplicateGraph({ nodes, edges }));
  }
}

/** Creates a graph containing only the analysed project root node. */
export function createRootOnlyGraph(packageJson = {}) {
  const rootName = packageJson.name || "root";
  return {
    nodes: [createRootNode(rootName, packageJson.version || null)],
    edges: []
  };
}

/** Creates the canonical root node consumed by the frontend contract. */
function createRootNode(name, version) {
  return {
    id: "root",
    name,
    version,
    dependencyType: "root",
    depth: 0,
    hasSmells: false,
    highestSeverity: null
  };
}

/** Infers a package name from a package-lock path, preserving scoped package names. */
function inferPackageNameFromLockPath(lockPath) {
  const normalized = lockPath.replaceAll("\\", "/");
  const marker = "node_modules/";
  const index = normalized.lastIndexOf(marker);
  const packagePath = index >= 0 ? normalized.slice(index + marker.length) : normalized;
  const segments = packagePath.split("/");

  if (segments[0]?.startsWith("@") && segments.length > 1) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0] || "unknown";
}

/** Counts nested node_modules segments to approximate dependency graph depth. */
function countPackageDepth(lockPath) {
  return (lockPath.match(/node_modules/g) ?? []).length || 1;
}

/** Collects dependency names from package-lock/package.json dependency sections. */
function packageDependencyNames(lockPackageInfo = {}, packageJson = {}, sections = ["dependencies"]) {
  const names = new Set();

  for (const section of sections) {
    for (const name of Object.keys(lockPackageInfo[section] ?? {})) {
      names.add(name);
    }

    for (const name of Object.keys(packageJson[section] ?? {})) {
      names.add(name);
    }
  }

  return names;
}

/** Collects dependency names declared by a package-lock package entry. */
function dependencyNamesFromPackageInfo(packageInfo = {}) {
  return packageDependencyNames(packageInfo, {}, ["dependencies", "optionalDependencies", "peerDependencies"]);
}

/** Merges legacy lockfile dependency maps from multiple dependency sections. */
function mergeDependencyMaps(packageInfo = {}, sections = ["dependencies"]) {
  return sections.reduce((merged, section) => ({ ...merged, ...(packageInfo[section] ?? {}) }), {});
}

/** Infers whether a package belongs to the production or development dependency scope. */
function inferDependencyType(packageName, packageInfo, rootProductionDeps, rootDevDeps) {
  if (rootProductionDeps.has(packageName)) {
    return "production";
  }

  if (rootDevDeps.has(packageName) || packageInfo.dev) {
    return "development";
  }

  return "production";
}

/** Resolves where a dependency is installed relative to a package-lock package path. */
function findDependencyPackagePath(fromPackagePath, dependencyName, packages) {
  let scope = fromPackagePath;

  while (true) {
    const candidate = scope ? `${scope}/node_modules/${dependencyName}` : `node_modules/${dependencyName}`;
    if (Object.hasOwn(packages, candidate)) {
      return candidate;
    }

    if (!scope) {
      return null;
    }

    const normalized = scope.replaceAll("\\", "/");
    const parentIndex = normalized.lastIndexOf("/node_modules/");
    scope = parentIndex >= 0 ? normalized.slice(0, parentIndex) : "";
  }
}

/** Removes duplicate graph nodes and edges while preserving the strongest dependency context. */
function deduplicateGraph(graph) {
  const nodesById = new Map();
  for (const node of graph.nodes) {
    if (!nodesById.has(node.id)) {
      nodesById.set(node.id, node);
      continue;
    }

    const existing = nodesById.get(node.id);
    existing.depth = Math.min(existing.depth, node.depth);
    if (existing.dependencyType !== "production" && node.dependencyType === "production") {
      existing.dependencyType = "production";
    }
  }

  const edgesByKey = new Map();
  for (const edge of graph.edges) {
    const key = `${edge.source}->${edge.target}:${edge.relationship}`;
    edgesByKey.set(key, edge);
  }

  return {
    nodes: [...nodesById.values()],
    edges: [...edgesByKey.values()]
  };
}

/** Recomputes node depths as the shortest dependency distance from the root node. */
function applyGraphDepths(graph) {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const adjacency = new Map();

  for (const edge of graph.edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  const visitedDepthById = new Map([["root", 0]]);
  const queue = [{ id: "root", depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    for (const target of adjacency.get(current.id) ?? []) {
      const nextDepth = current.depth + 1;
      if (visitedDepthById.has(target) && visitedDepthById.get(target) <= nextDepth) {
        continue;
      }

      visitedDepthById.set(target, nextDepth);
      queue.push({ id: target, depth: nextDepth });
    }
  }

  for (const node of graph.nodes) {
    if (visitedDepthById.has(node.id)) {
      node.depth = visitedDepthById.get(node.id);
    } else if (node.id === "root") {
      node.depth = 0;
    } else {
      node.depth = null;
    }
  }

  return {
    nodes: [...nodeById.values()],
    edges: graph.edges
  };
}

/** Recomputes dependency scopes from direct production/dev entry points. */
function applyDependencyScopes(graph, productionEntryIds, developmentEntryIds) {
  const adjacency = buildAdjacency(graph.edges);
  const productionReachable = collectReachableIds(productionEntryIds, adjacency);
  const developmentReachable = collectReachableIds(developmentEntryIds, adjacency);

  for (const node of graph.nodes) {
    if (node.id === "root") {
      node.dependencyType = "root";
    } else if (productionReachable.has(node.id)) {
      node.dependencyType = "production";
    } else if (developmentReachable.has(node.id)) {
      node.dependencyType = "development";
    }
  }

  return graph;
}

/** Builds an adjacency list from directed dependency graph edges. */
function buildAdjacency(edges) {
  const adjacency = new Map();

  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  return adjacency;
}

/** Collects all nodes reachable from a set of graph entry points. */
function collectReachableIds(entryIds, adjacency) {
  const visited = new Set();
  const queue = [...entryIds];

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) {
      continue;
    }

    visited.add(id);
    queue.push(...(adjacency.get(id) ?? []));
  }

  return visited;
}

/** Finds the graph node matching a package name and optional version. */
export function findNodeForPackage(graph, packageName, packageVersion = null) {
  if (!graph?.nodes || !packageName) {
    return null;
  }

  if (packageVersion) {
    const exactId = toPackageNodeId(packageName, packageVersion);
    const exact = graph.nodes.find((node) => node.id === exactId);
    if (exact) {
      return exact;
    }
  }

  return graph.nodes.find((node) => node.name === packageName) ?? null;
}

/** Extracts only the package name from a full package identifier. */
export function packageNameFromIdentifier(identifier) {
  return parsePackageIdentifier(identifier).name;
}
