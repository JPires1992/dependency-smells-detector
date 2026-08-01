import { findNodeForPackage } from "../../analysis/PackageLockGraphExtractor.js";
import { SmellTypes } from "../../domain/SmellCatalog.js";
import { ConstraintKind, SpecifierSource } from "./NpmDependencySpecifierParser.js";

/** Detection source written to findings produced by repository-level custom rules. */
const DETECTION_SOURCE = "CustomSmellDetector";

/** Evaluates one normalized dependency specifier against a configurable smell predicate. */
export class DependencySpecifierRule {
  /** Configures the smell type, matching predicate, and concise evidence description. */
  constructor({ name, smellType, matches, describe }) {
    this.name = name;
    this.smellType = smellType;
    this.matches = matches;
    this.describe = describe;
  }

  /** Returns one normalized finding when the dependency declaration violates this rule. */
  evaluate({ dependency, specifier, graph }) {
    if (!this.matches(specifier)) {
      return null;
    }

    const node = findDeclaredDependencyNode(graph, dependency.name);
    return {
      type: this.smellType,
      affectedPackage: dependency.name,
      affectedVersion: node?.version ?? null,
      detectionSource: DETECTION_SOURCE,
      evidence: this.describe(dependency, specifier),
      evidenceData: {
        manifestPath: "package.json",
        dependencySection: dependency.section,
        dependencyType: dependency.dependencyType,
        declaredConstraint: dependency.constraint,
        specifierType: specifier.parserType,
        constraintKind: specifier.constraintKind,
        normalizedRange: specifier.normalizedRange,
        recommendedRange: specifier.recommendedRange
      }
    };
  }
}

/** Detects a missing npm lockfile only when repository inspection conclusively confirmed absence. */
export class NoPackageLockRule {
  /** Identifies the project-level rule in custom detector diagnostics. */
  constructor() {
    this.name = "NoPackageLockRule";
  }

  /** Returns a root-project finding for a confirmed missing package-lock or npm-shrinkwrap file. */
  evaluate({ project, manifests }) {
    if (manifests?.lockfileStatus !== "missing") {
      return null;
    }

    return {
      type: SmellTypes.NO_PACKAGE_LOCK,
      affectedPackage: project.name,
      affectedVersion: manifests.packageJson?.version ?? null,
      detectionSource: DETECTION_SOURCE,
      evidence: "The repository does not contain package-lock.json or npm-shrinkwrap.json at the analysed ref.",
      evidenceData: {
        repository: project.repository,
        analysedRef: project.analysedRef,
        lockfileStatus: manifests.lockfileStatus,
        checkedLockfilePaths: manifests.checkedLockfilePaths ?? [
          "package-lock.json",
          "npm-shrinkwrap.json"
        ]
      }
    };
  }
}

/** Builds the default dependency rules without coupling the detector to individual smell classes. */
export function createDefaultDependencySpecifierRules() {
  return [
    new DependencySpecifierRule({
      name: "PinnedDependencyRule",
      smellType: SmellTypes.PINNED_DEPENDENCY,
      matches: (specifier) => specifier.constraintKind === ConstraintKind.PINNED,
      describe: (dependency) =>
        `Dependency '${dependency.name}' is pinned to exact version '${dependency.constraint}', so updates require a manifest change.`
    }),
    new DependencySpecifierRule({
      name: "HardcodedUrlRule",
      smellType: SmellTypes.HARDCODED_URL,
      matches: (specifier) => specifier.source === SpecifierSource.URL,
      describe: (dependency) =>
        `Dependency '${dependency.name}' is fetched directly from '${dependency.constraint}' instead of a registry version.`
    }),
    new DependencySpecifierRule({
      name: "RestrictiveConstraintRule",
      smellType: SmellTypes.RESTRICTIVE_CONSTRAINT,
      matches: (specifier) => specifier.constraintKind === ConstraintKind.RESTRICTIVE,
      describe: (dependency) =>
        `Dependency '${dependency.name}' uses restrictive constraint '${dependency.constraint}', excluding SemVer-compatible updates.`
    }),
    new DependencySpecifierRule({
      name: "PermissiveConstraintRule",
      smellType: SmellTypes.PERMISSIVE_CONSTRAINT,
      matches: (specifier) => specifier.constraintKind === ConstraintKind.PERMISSIVE,
      describe: (dependency) =>
        `Dependency '${dependency.name}' uses permissive constraint '${dependency.constraint}', allowing potentially incompatible updates.`
    })
  ];
}

/** Resolves the root declaration node before falling back to any package node with the same name. */
function findDeclaredDependencyNode(graph, dependencyName) {
  const nodeById = new Map((graph?.nodes ?? []).map((node) => [node.id, node]));
  const directNode = (graph?.edges ?? [])
    .filter((edge) => edge.source === "root")
    .map((edge) => nodeById.get(edge.target))
    .find((node) => node?.name === dependencyName);

  return directNode ?? findNodeForPackage(graph, dependencyName);
}
