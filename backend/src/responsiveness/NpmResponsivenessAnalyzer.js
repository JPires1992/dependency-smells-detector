import { PackageGraphIndex } from "../analysis/PackageGraphIndex.js";
import { collectManifestDependencies } from "../detectors/custom/ManifestDependencyCollector.js";
import { NpmDependencySpecifierParser } from "../detectors/custom/NpmDependencySpecifierParser.js";
import { toPackageNodeId } from "../domain/PackageIdentifier.js";
import { mapWithConcurrency } from "../utils/AsyncPool.js";
import { ResponsivenessPolicy } from "./ResponsivenessPolicy.js";
import { requireBoolean, requirePositiveInteger } from "../utils/ConfigurationValue.js";

const MAX_WARNING_EXAMPLES = 10;

/** Produces package-level R evidence from npm activity, maintenance, and constraints. */
export class NpmResponsivenessAnalyzer {
  /** Configures replaceable metadata providers, policy, parser, and bounded concurrency. */
  constructor({
    activityProvider,
    policy = new ResponsivenessPolicy(),
    specifierParser = new NpmDependencySpecifierParser(),
    concurrency,
    required,
    clock = () => new Date()
  } = {}) {
    if (typeof activityProvider?.getActivity !== "function") {
      throw new Error("NpmResponsivenessAnalyzer requires a package activity provider.");
    }

    this.name = "NpmResponsivenessAnalyzer";
    this.activityProvider = activityProvider;
    this.policy = policy;
    this.specifierParser = specifierParser;
    this.concurrency = requirePositiveInteger(concurrency, "responsiveness.concurrency");
    this.required = requireBoolean(required, "responsiveness.required");
    this.clock = clock;
  }

  /** Reports whether this analyzer supports the supplied package manager. */
  supports(packageManager) {
    return packageManager === "npm";
  }

  /** Classifies every exact package referenced by at least one smell finding. */
  async analyze({
    findings = [],
    packageMetadata = {},
    manifests = {},
    graph = {},
    project = {}
  } = {}) {
    const analysedAt = this.clock();
    const updateStrategies = this.#buildUpdateStrategies(manifests.packageJson, graph);
    const targets = collectFindingTargets(findings, graph);
    const analyses = await mapWithConcurrency(
      targets,
      this.concurrency,
      (target) => this.#analyzeTarget({
        target,
        packageMetadata,
        project,
        updateStrategies,
        analysedAt
      })
    );
    const packages = {};
    const warnings = [];

    for (const analysis of analyses) {
      packages[analysis.packageId] = analysis.evidence;
      if (analysis.warning) {
        warnings.push(analysis.warning);
      }
    }

    return {
      status: warnings.length === 0 ? "complete" : "partial",
      packages,
      warnings: summarizeWarnings(warnings, targets.length)
    };
  }

  /** Selects repository activity for the root and npm activity for dependency packages. */
  async #analyzeTarget({ target, packageMetadata, project, updateStrategies, analysedAt }) {
    const metadata = target.isProjectRoot
      ? createProjectRootMetadata(project.repositoryMetadata)
      : packageMetadata[target.packageId] ?? {};
    const updateStrategy = updateStrategies.get(target.packageId) ?? null;
    let activity = target.isProjectRoot
      ? createRepositoryActivity(project.repositoryMetadata, analysedAt)
      : null;
    let warning = null;

    if (target.isProjectRoot && !activity && metadata.archived !== true) {
      const error = new Error("GitHub repository activity metadata is unavailable.");
      if (this.required) {
        throw error;
      }
      warning = `${target.packageId}: ${error.message}`;
    } else if (!target.isProjectRoot && !isConclusiveHighRisk(target.finding, metadata)) {
      try {
        activity = await this.activityProvider.getActivity(
          target.packageName,
          target.packageVersion,
          analysedAt
        );
      } catch (error) {
        if (this.required) {
          throw error;
        }
        warning = `${target.packageId}: npm release activity could not be retrieved: ${error.message}`;
      }
    }

    return {
      packageId: target.packageId,
      evidence: this.policy.evaluate({
        finding: target.finding,
        packageMetadata: metadata,
        activity,
        updateStrategy,
        isProjectRoot: target.isProjectRoot
      }),
      warning
    };
  }

  /** Parses direct project constraints once for package-level update-strategy evidence. */
  #buildUpdateStrategies(packageJson = {}, graph = {}) {
    const strategies = new Map();
    const graphIndex = new PackageGraphIndex(graph);

    for (const dependency of collectManifestDependencies(packageJson)) {
      const node = graphIndex.resolveDirectDependency(dependency.name);
      if (!node) {
        continue;
      }
      const specifier = this.specifierParser.parse(dependency.name, dependency.constraint);
      strategies.set(node.id, {
        constraintKind: specifier.constraintKind,
        declaredConstraint: dependency.constraint,
        normalizedRange: specifier.normalizedRange
      });
    }

    return strategies;
  }
}

/** Deduplicates findings by exact package id while retaining one representative finding. */
function collectFindingTargets(findings, graph = {}) {
  const targets = new Map();
  const graphIndex = new PackageGraphIndex(graph);

  for (const finding of findings) {
    const packageId = graphIndex.resolveFinding(finding)?.id
      ?? toPackageNodeId(finding.affectedPackage, finding.affectedVersion);
    if (!targets.has(packageId)) {
      targets.set(packageId, {
        packageId,
        packageName: finding.affectedPackage,
        packageVersion: finding.affectedVersion,
        finding,
        isProjectRoot: packageId === "root"
      });
    } else if (finding.type === "Deprecated") {
      targets.get(packageId).finding = finding;
    }
  }

  return [...targets.values()];
}

/** Keeps only repository-owned metadata when classifying the analysed project root. */
function createProjectRootMetadata(repositoryMetadata) {
  if (!repositoryMetadata) {
    return {};
  }

  return {
    archived: repositoryMetadata.archived === true,
    metadataSource: repositoryMetadata.metadataSource ?? "GitHub Repository"
  };
}

/** Normalizes GitHub repository activity into the common responsiveness evidence shape. */
function createRepositoryActivity(repositoryMetadata, analysedAt) {
  const pushedAt = normalizeDate(repositoryMetadata?.pushedAt);
  const analysisDate = normalizeDate(analysedAt);
  if (!pushedAt || !analysisDate) {
    return null;
  }

  return {
    status: "complete",
    activityKind: "repository",
    latestActivityAt: pushedAt.toISOString(),
    daysSinceLatestActivity: Math.max(
      0,
      Math.floor((analysisDate.getTime() - pushedAt.getTime()) / (24 * 60 * 60 * 1000))
    ),
    metadataSource: repositoryMetadata.metadataSource ?? "GitHub Repository"
  };
}

/** Parses valid activity timestamps without allowing malformed metadata into scoring. */
function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

/** Avoids unnecessary registry calls for packages already known to be deprecated or archived. */
function isConclusiveHighRisk(finding, packageMetadata) {
  return finding.type === "Deprecated"
    || packageMetadata.deprecated === true
    || packageMetadata.allDeprecated === true
    || packageMetadata.archived === true;
}

/** Aggregates optional registry failures without flooding generated reports. */
function summarizeWarnings(warnings, targetCount) {
  if (warnings.length === 0) {
    return [];
  }

  const examples = warnings.slice(0, MAX_WARNING_EXAMPLES);
  return [
    `Responsiveness coverage incomplete: ${warnings.length} of ${targetCount} smelled package profiles could not retrieve activity metadata; conservative R evidence was recorded explicitly.`,
    ...examples,
    ...(warnings.length > examples.length
      ? [`${warnings.length - examples.length} additional responsiveness warnings were omitted.`]
      : [])
  ];
}
