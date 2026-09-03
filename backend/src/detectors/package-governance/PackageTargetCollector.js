import { toPackageNodeId } from "../../domain/PackageIdentifier.js";

/** Collects unique registry package targets and lockfile install-script hints. */
export function collectPackageTargets(graph, packageLock) {
  const hasModernPackageMap = packageLock?.packages
    && typeof packageLock.packages === "object";
  const installScriptPackageIds = collectInstallScriptPackageIds(packageLock);
  const targetsById = new Map();

  for (const node of graph?.nodes ?? []) {
    if (node.id === "root" || !node.name || !node.version) {
      continue;
    }

    targetsById.set(node.id, {
      node,
      hasInstallScriptHint: hasModernPackageMap
        ? installScriptPackageIds.has(node.id)
        : true
    });
  }

  return [...targetsById.values()];
}

/** Extracts exact package ids marked by npm as having installation lifecycle scripts. */
function collectInstallScriptPackageIds(packageLock) {
  const packageIds = new Set();

  for (const [packagePath, packageInfo] of Object.entries(packageLock?.packages ?? {})) {
    if (!packagePath || packageInfo?.hasInstallScript !== true || !packageInfo.version) {
      continue;
    }

    const packageName = packageInfo.name || inferPackageNameFromLockPath(packagePath);
    packageIds.add(toPackageNodeId(packageName, packageInfo.version));
  }

  return packageIds;
}

/** Infers scoped and unscoped package names from npm installation paths. */
function inferPackageNameFromLockPath(packagePath) {
  const normalized = packagePath.replaceAll("\\", "/");
  const markerIndex = normalized.lastIndexOf("node_modules/");
  const relativePath = markerIndex >= 0
    ? normalized.slice(markerIndex + "node_modules/".length)
    : normalized;
  const segments = relativePath.split("/");

  return segments[0]?.startsWith("@") && segments[1]
    ? `${segments[0]}/${segments[1]}`
    : segments[0];
}
