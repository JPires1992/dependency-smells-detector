import { findNodeForPackage } from "../../analysis/PackageLockGraphExtractor.js";
import { SmellTypes } from "../../domain/SmellCatalog.js";
import { collectManifestDependencies } from "../custom/ManifestDependencyCollector.js";

/** Detection source written to findings derived from Knip source-usage analysis. */
const DETECTION_SOURCE = "KnipAdapter";

/** Converts Knip dependency issues into the backend's normalized smell findings. */
export class KnipOutputParser {
  /** Maps unused and unlisted dependency issues while retaining source evidence. */
  parse(report, { project, graph, manifests } = {}) {
    const findings = [];
    const warnings = [];
    const packageJson = manifests?.packageJson ?? {};
    const declarations = new Map(
      collectManifestDependencies(packageJson).map((dependency) => [dependency.name, dependency])
    );

    for (const [packageName, locations] of collectIssues(report, [
      "dependencies",
      "devDependencies"
    ])) {
      const dependency = declarations.get(packageName);
      if (!dependency) {
        warnings.push(
          `Knip reported undeclared unused dependency '${packageName}'; the issue was ignored.`
        );
        continue;
      }

      const node = findDirectDependencyNode(graph, packageName)
        ?? findNodeForPackage(graph, packageName);
      findings.push(createUnusedDependencyFinding(dependency, node, locations));
    }

    for (const [packageName, locations] of collectIssues(report, ["unlisted"])) {
      findings.push(createMissingDependencyFinding(packageName, project, locations));
    }

    return { findings, warnings };
  }
}

/** Creates an Unused Dependency finding for one declared package without references. */
function createUnusedDependencyFinding(dependency, node, locations) {
  return {
    type: SmellTypes.UNUSED_DEPENDENCY,
    affectedPackage: dependency.name,
    affectedVersion: node?.version ?? null,
    detectionSource: DETECTION_SOURCE,
    evidence: `Dependency '${dependency.name}' is declared in ${dependency.section} but Knip found no usage.`,
    evidenceData: {
      sourceAnalyzer: "Knip",
      manifestPath: "package.json",
      dependencySection: dependency.section,
      dependencyType: dependency.dependencyType,
      declaredConstraint: dependency.constraint,
      analyzerIssueType: dependency.section === "devDependencies"
        ? "devDependencies"
        : "dependencies",
      locations
    }
  };
}

/** Creates a Missing Dependency finding and explicit synthetic graph context. */
function createMissingDependencyFinding(packageName, project, locations) {
  return {
    type: SmellTypes.MISSING_DEPENDENCY,
    affectedPackage: packageName,
    affectedVersion: null,
    detectionSource: DETECTION_SOURCE,
    evidence: `Package '${packageName}' is referenced by source code but is not declared in package.json.`,
    evidenceData: {
      sourceAnalyzer: "Knip",
      analyzerIssueType: "unlisted",
      manifestPath: "package.json",
      dependencyType: "unknown",
      usageLocations: locations,
      productionReachabilityValue: 0.5,
      graphContext: {
        synthetic: true,
        depth: 1,
        dependencyType: "unknown",
        parentNodeIds: ["root"],
        projectName: project?.name ?? "root"
      }
    }
  };
}

/** Groups and deduplicates Knip issue locations by package name. */
function collectIssues(report, issueTypes) {
  const issuesByPackage = new Map();

  for (const issueGroup of report?.issues ?? []) {
    for (const issueType of issueTypes) {
      for (const issue of issueGroup?.[issueType] ?? []) {
        const packageName = typeof issue === "string" ? issue : issue?.name;
        if (!packageName) {
          continue;
        }

        const locations = issuesByPackage.get(packageName) ?? new Map();
        const location = normalizeIssueLocation(issueGroup.file, issue);
        const key = `${location.file ?? ""}:${location.line ?? ""}:${location.column ?? ""}`;
        locations.set(key, location);
        issuesByPackage.set(packageName, locations);
      }
    }
  }

  return [...issuesByPackage].map(([packageName, locations]) => [
    packageName,
    [...locations.values()]
  ]);
}

/** Normalizes one Knip issue location to stable JSON field names. */
function normalizeIssueLocation(file, issue) {
  return {
    file: file ?? null,
    line: typeof issue?.line === "number" ? issue.line : null,
    column: typeof issue?.col === "number" ? issue.col : null
  };
}

/** Resolves a package node connected directly to the root before transitive fallbacks. */
function findDirectDependencyNode(graph, packageName) {
  const nodeById = new Map((graph?.nodes ?? []).map((node) => [node.id, node]));

  return (graph?.edges ?? [])
    .filter((edge) => edge.source === "root")
    .map((edge) => nodeById.get(edge.target))
    .find((node) => node?.name === packageName) ?? null;
}
