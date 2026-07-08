/** Splits an npm-style package identifier into package name and version components. */
export function parsePackageIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return { name: "unknown", version: null };
  }

  const trimmed = identifier.trim().replace(/^`|`$/g, "");
  const versionSeparatorIndex = trimmed.lastIndexOf("@");

  if (versionSeparatorIndex <= 0) {
    return { name: trimmed, version: null };
  }

  return {
    name: trimmed.slice(0, versionSeparatorIndex),
    version: trimmed.slice(versionSeparatorIndex + 1) || null
  };
}

/** Builds the stable graph node id used for dependency packages. */
export function toPackageNodeId(name, version) {
  if (!name) {
    return "unknown";
  }

  return version ? `${name}@${version}` : name;
}
