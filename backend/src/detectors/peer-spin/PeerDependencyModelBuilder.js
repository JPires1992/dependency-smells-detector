import { toPackageNodeId } from "../../domain/PackageIdentifier.js";

/** Dependency sections that participate in npm's installed regular dependency tree. */
const ROOT_REGULAR_SECTIONS = Object.freeze([
  "dependencies",
  "devDependencies",
  "optionalDependencies"
]);
const PACKAGE_REGULAR_SECTIONS = Object.freeze(["dependencies", "optionalDependencies"]);

/** Builds a path-sensitive npm model that retains regular and peer dependency constraints. */
export class PeerDependencyModelBuilder {
  /** Converts a modern npm lockfile into the internal PeerSpin detection model. */
  build({ packageLock, packageJson = {} } = {}) {
    if (!packageLock?.packages || typeof packageLock.packages !== "object") {
      return {
        model: null,
        warnings: [
          "PeerSpin analysis requires package-lock.json lockfileVersion 2 or 3 with a packages map."
        ]
      };
    }

    const packages = normalizePackagePaths(packageLock.packages);
    const nodesByPath = buildNodes(packages, packageJson, packageLock);
    if (!nodesByPath.has("")) {
      return {
        model: null,
        warnings: ["PeerSpin analysis requires a root entry in package-lock.json packages."]
      };
    }
    const regularEdges = [];
    const peerRequirements = [];
    let unresolvedRequiredEdges = 0;

    for (const node of nodesByPath.values()) {
      const regularSections = node.path === ""
        ? ROOT_REGULAR_SECTIONS
        : PACKAGE_REGULAR_SECTIONS;

      for (const section of regularSections) {
        for (const [targetName, range] of Object.entries(node.manifest?.[section] ?? {})) {
          const targetPath = resolveInstalledDependencyPath(node.path, targetName, packages);
          if (!targetPath) {
            if (section !== "optionalDependencies" && node.manifest?.optional !== true) {
              unresolvedRequiredEdges += 1;
            }
            continue;
          }

          regularEdges.push({
            sourcePath: node.path,
            targetPath,
            targetName,
            range: String(range),
            section
          });
        }
      }

      for (const [targetName, range] of Object.entries(node.manifest?.peerDependencies ?? {})) {
        peerRequirements.push({
          sourcePath: node.path,
          targetName,
          range: String(range),
          optional: node.manifest?.peerDependenciesMeta?.[targetName]?.optional === true,
          providerPath: resolvePeerProviderPath(node.path, targetName, packages)
        });
      }
    }

    const warnings = unresolvedRequiredEdges > 0
      ? [`PeerSpin model skipped ${unresolvedRequiredEdges} required lockfile edges without an installed target.`]
      : [];

    return {
      model: {
        nodesByPath,
        regularEdges,
        peerRequirements,
        regularEdgesBySource: groupBySourcePath(regularEdges),
        peerRequirementsBySource: groupBySourcePath(peerRequirements),
        rootManifest: nodesByPath.get("")?.manifest ?? packageJson
      },
      warnings
    };
  }
}

/** Normalizes Windows separators in lockfile package paths before path-based resolution. */
function normalizePackagePaths(packages) {
  return Object.fromEntries(
    Object.entries(packages).map(([packagePath, packageInfo]) => [
      packagePath.replaceAll("\\", "/").replace(/^\.\//, ""),
      packageInfo ?? {}
    ])
  );
}

/** Creates path-unique package nodes and merges authoritative root manifest declarations. */
function buildNodes(packages, packageJson, packageLock) {
  const nodesByPath = new Map();

  for (const [packagePath, packageInfo] of Object.entries(packages)) {
    const isRoot = packagePath === "";
    const name = isRoot
      ? packageJson.name || packageLock.name || packageInfo.name || "root"
      : packageInfo.name || inferPackageNameFromLockPath(packagePath);
    const version = isRoot
      ? packageJson.version || packageLock.version || packageInfo.version || null
      : packageInfo.version || null;
    const manifest = isRoot
      ? mergeRootManifest(packageInfo, packageJson)
      : packageInfo;

    nodesByPath.set(packagePath, {
      path: packagePath,
      id: isRoot ? "root" : toPackageNodeId(name, version),
      name,
      version,
      manifest
    });
  }

  return nodesByPath;
}

/** Merges root lockfile metadata with the repository package.json section by section. */
function mergeRootManifest(lockRoot = {}, packageJson = {}) {
  const merged = { ...lockRoot, ...packageJson };

  for (const section of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
    "peerDependenciesMeta"
  ]) {
    merged[section] = {
      ...(lockRoot[section] ?? {}),
      ...(packageJson[section] ?? {})
    };
  }

  return merged;
}

/** Infers scoped and unscoped package names from npm package installation paths. */
function inferPackageNameFromLockPath(packagePath) {
  const markerIndex = packagePath.lastIndexOf("node_modules/");
  const relativePackagePath = markerIndex >= 0
    ? packagePath.slice(markerIndex + "node_modules/".length)
    : packagePath;
  const segments = relativePackagePath.split("/");

  if (segments[0]?.startsWith("@") && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0] || "unknown";
}

/** Resolves a regular dependency using npm's nearest installed node_modules lookup. */
export function resolveInstalledDependencyPath(sourcePath, dependencyName, packages) {
  let scope = sourcePath;

  while (true) {
    const candidate = scope
      ? `${scope}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (Object.hasOwn(packages, candidate)) {
      return candidate;
    }

    if (!scope) {
      return null;
    }

    scope = parentPackagePath(scope);
  }
}

/** Resolves a peer provider at the requester's level or an ancestor installation level. */
export function resolvePeerProviderPath(sourcePath, dependencyName, packages) {
  let scope = parentPackagePath(sourcePath);

  while (true) {
    const candidate = scope
      ? `${scope}/node_modules/${dependencyName}`
      : `node_modules/${dependencyName}`;
    if (Object.hasOwn(packages, candidate)) {
      return candidate;
    }

    if (!scope) {
      return null;
    }

    scope = parentPackagePath(scope);
  }
}

/** Computes the shared installation position used when placing a peer next to its entry. */
export function peerPlacementPath(peerEntryPath, dependencyName) {
  const parentPath = parentPackagePath(peerEntryPath);
  return parentPath
    ? `${parentPath}/node_modules/${dependencyName}`
    : `node_modules/${dependencyName}`;
}

/** Returns the containing package path for one nested npm installation path. */
function parentPackagePath(packagePath) {
  if (!packagePath) {
    return "";
  }

  const marker = "/node_modules/";
  const markerIndex = packagePath.lastIndexOf(marker);
  return markerIndex >= 0 ? packagePath.slice(0, markerIndex) : "";
}

/** Groups path-based dependency records for bounded graph traversal. */
function groupBySourcePath(records) {
  const grouped = new Map();

  for (const record of records) {
    const values = grouped.get(record.sourcePath) ?? [];
    values.push(record);
    grouped.set(record.sourcePath, values);
  }

  return grouped;
}
