import { NpmRegistryClient } from "../../registry/npm/NpmRegistryClient.js";
import { mapWithConcurrency } from "../../utils/AsyncPool.js";
import { DomainRegistrationVerifier } from "./DomainRegistrationVerifier.js";
import { GovernanceThresholdPolicy } from "./GovernanceThresholdPolicy.js";
import { MaintainerDomainParser } from "./MaintainerDomainParser.js";
import { normalizePeople } from "./PackageMetadataNormalizer.js";
import { collectPackageTargets } from "./PackageTargetCollector.js";
import {
  ExpiredMaintainerDomainRule,
  InstallScriptExecutionRule,
  TooManyContributorsRule,
  TooManyMaintainersRule
} from "./PackageGovernanceRules.js";

const DEFAULT_CONCURRENCY = 4;
const MAX_DIAGNOSTIC_WARNINGS = 20;

/** Coordinates npm package metadata rules and external maintainer-domain verification. */
export class PackageGovernanceDetector {
  /** Configures replaceable providers, rules, thresholds, and resource limits. */
  constructor({
    metadataProvider = new NpmRegistryClient(),
    domainVerifier = new DomainRegistrationVerifier(),
    domainParser = new MaintainerDomainParser(),
    thresholdPolicy = new GovernanceThresholdPolicy(),
    installScriptRule = new InstallScriptExecutionRule(),
    governanceRules = null,
    concurrency = readPositiveInteger(
      process.env.PACKAGE_GOVERNANCE_CONCURRENCY,
      DEFAULT_CONCURRENCY
    ),
    required = false
  } = {}) {
    this.name = "PackageGovernanceDetector";
    this.metadataProvider = metadataProvider;
    this.installScriptRule = installScriptRule;
    this.governanceRules = governanceRules ?? [
      new ExpiredMaintainerDomainRule({ domainParser, domainVerifier }),
      new TooManyMaintainersRule({ thresholdPolicy }),
      new TooManyContributorsRule({ thresholdPolicy })
    ];
    this.concurrency = concurrency;
    this.required = required;
  }

  /** Detects package governance and install-script smells across the dependency graph. */
  async detect(context) {
    if (context.project?.packageManager !== "npm") {
      return this.#unavailable(
        "Package governance analysis was skipped because the project is not using npm."
      );
    }

    const findings = await this.#evaluateRootInstallScripts(context);
    const targets = collectPackageTargets(context.graph, context.manifests?.packageLock);
    const analyses = await mapWithConcurrency(
      targets,
      this.concurrency,
      (target) => this.#analyzePackage(target)
    );
    const warnings = [];
    let missingContributorMetadata = 0;

    for (const analysis of analyses) {
      findings.push(...analysis.findings);
      warnings.push(...analysis.warnings);
      missingContributorMetadata += analysis.missingContributorMetadata ? 1 : 0;
    }

    if (missingContributorMetadata > 0) {
      warnings.unshift(
        `Too Many Contributors was not evaluated for ${missingContributorMetadata} package versions because latest npm metadata did not declare contributors.`
      );
    }

    return {
      findings,
      warnings: limitWarnings(warnings, MAX_DIAGNOSTIC_WARNINGS)
    };
  }

  /** Applies repository-root install hooks without treating the root as an npm dependency. */
  async #evaluateRootInstallScripts(context) {
    if (context.manifests?.packageJsonStatus !== "present") {
      return [];
    }

    const rootNode = context.graph?.nodes?.find((node) => node.id === "root");
    if (!rootNode) {
      return [];
    }

    const result = await this.installScriptRule.evaluate({
      node: rootNode,
      manifest: context.manifests.packageJson,
      metadataSource: "Code Repository",
      metadataScope: "analysed repository manifest"
    });
    return result.finding ? [result.finding] : [];
  }

  /** Fetches the minimum metadata needed and evaluates every independent package rule. */
  async #analyzePackage(target) {
    const result = {
      findings: [],
      warnings: [],
      missingContributorMetadata: false
    };
    let latestManifest = null;

    try {
      latestManifest = await this.metadataProvider.getLatestManifest(target.node.name);
    } catch (error) {
      this.#recordFailure(
        result,
        `${target.node.id}: latest npm metadata could not be retrieved: ${error.message}`
      );
    }

    if (latestManifest) {
      const maintainers = normalizePeople(latestManifest.maintainers);
      const contributors = normalizePeople(latestManifest.contributors);
      const contributorsDeclared = Object.hasOwn(latestManifest, "contributors");
      result.missingContributorMetadata = !contributorsDeclared;

      for (const rule of this.governanceRules) {
        const ruleResult = await rule.evaluate({
          node: target.node,
          manifest: latestManifest,
          maintainers,
          contributors,
          contributorsDeclared
        });
        if (ruleResult.finding) {
          result.findings.push(ruleResult.finding);
        }
        result.warnings.push(...(ruleResult.warnings ?? []));
      }
    }

    if (target.hasInstallScriptHint) {
      try {
        const installedManifest = String(latestManifest?.version) === String(target.node.version)
          ? latestManifest
          : await this.metadataProvider.getVersionManifest(
              target.node.name,
              target.node.version
            );
        const ruleResult = await this.installScriptRule.evaluate({
          node: target.node,
          manifest: installedManifest,
          metadataSource: "npm Registry",
          metadataScope: "installed package version"
        });
        if (ruleResult.finding) {
          result.findings.push(ruleResult.finding);
        }
      } catch (error) {
        this.#recordFailure(
          result,
          `${target.node.id}: exact npm metadata could not be retrieved: ${error.message}`
        );
      }
    }

    return result;
  }

  /** Converts an external metadata failure to a warning or a mandatory-detector error. */
  #recordFailure(result, message) {
    if (this.required) {
      throw new Error(message);
    }
    result.warnings.push(message);
  }

  /** Converts an unavailable prerequisite to the configured optional-detector contract. */
  #unavailable(message) {
    if (this.required) {
      throw new Error(message);
    }
    return { findings: [], warnings: [message] };
  }
}

/** Keeps reports useful when many registry or domain lookups fail simultaneously. */
function limitWarnings(warnings, maximum) {
  const uniqueWarnings = [...new Set(warnings)];
  if (uniqueWarnings.length <= maximum) {
    return uniqueWarnings;
  }

  return [
    ...uniqueWarnings.slice(0, maximum),
    `${uniqueWarnings.length - maximum} additional package governance warnings were omitted.`
  ];
}

/** Reads a positive integer worker count while preserving a deterministic fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
