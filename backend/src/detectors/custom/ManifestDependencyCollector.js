/** Dependency sections analyzed by custom manifest rules in increasing precedence order. */
const ANALYSED_DEPENDENCY_SECTIONS = Object.freeze([
  ["devDependencies", "development"],
  ["dependencies", "production"],
  ["optionalDependencies", "production"]
]);

/** Collects unique npm dependency declarations and their project dependency scope. */
export function collectManifestDependencies(packageJson = {}) {
  const dependenciesByName = new Map();

  for (const [section, dependencyType] of ANALYSED_DEPENDENCY_SECTIONS) {
    for (const [name, constraint] of Object.entries(packageJson[section] ?? {})) {
      if (typeof constraint !== "string") {
        continue;
      }

      dependenciesByName.set(name, {
        name,
        constraint,
        section,
        dependencyType
      });
    }
  }

  return [...dependenciesByName.values()];
}
