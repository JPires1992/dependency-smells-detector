import { readFile } from "node:fs/promises";
import path from "node:path";
import { parsePackageIdentifier, toPackageNodeId } from "../domain/PackageIdentifier.js";

/** Extracts a dependency graph from npm package-lock.json files. */
export class PackageLockGraphExtractor {
  /** Reads the lockfile and returns normalized graph nodes and edges. */
  async extract(projectDirectory, packageJson = {}) {
    const lockfilePath = path.join(projectDirectory, "package-lock.json");
    const lockfile = JSON.parse(await readFile(lockfilePath, "utf8"));

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

    const rootProductionDeps = new Set(Object.keys(rootPackage.dependencies ?? packageJson.dependencies ?? {}));
    const rootDevDeps = new Set(Object.keys(rootPackage.devDependencies ?? packageJson.devDependencies ?? {}));

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
        edges.push({ source: rootNode.id, target: nodesByPath.get(targetPath).id, relationship: "direct" });
      }
    }

    for (const depName of rootDevDeps) {
      const targetPath = findDependencyPackagePath("", depName, packages);
      if (targetPath && nodesByPath.has(targetPath)) {
        edges.push({ source: rootNode.id, target: nodesByPath.get(targetPath).id, relationship: "direct" });
      }
    }

    for (const [packagePath, packageInfo] of Object.entries(packages)) {
      if (!packagePath || !packageInfo.dependencies) {
        continue;
      }

      const sourceNode = nodesByPath.get(packagePath);
      if (!sourceNode) {
        continue;
      }

      for (const depName of Object.keys(packageInfo.dependencies)) {
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

    return deduplicateGraph({ nodes, edges });
  }

  /** Extracts graph data from legacy package-lock dependency trees. */
  #extractFromLegacyDependencies(lockfile, packageJson) {
    const rootName = packageJson.name || lockfile.name || "root";
    const rootNode = createRootNode(rootName, packageJson.version || lockfile.version || null);
    const nodes = [rootNode];
    const edges = [];
    const rootProductionDeps = new Set(Object.keys(packageJson.dependencies ?? {}));
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

        visit(data.dependencies, id, depth + 1);
      }
    };

    visit(lockfile.dependencies, rootNode.id, 1);
    return deduplicateGraph({ nodes, edges });
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
