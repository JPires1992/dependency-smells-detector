import { SmellTypes } from "../domain/SmellCatalog.js";
import { ConstraintKind } from "../detectors/custom/NpmDependencySpecifierParser.js";
import semver from "semver";

/** Converts package maintenance and update evidence into the documented R dimension. */
export class ResponsivenessPolicy {
  /** Configures explicit release-activity thresholds used by the prototype. */
  constructor({
    recentReleaseDays = 365,
    inactiveReleaseDays = 730,
    frequentReleasesPerYear = 4
  } = {}) {
    this.recentReleaseDays = readPositiveNumber(recentReleaseDays, "recentReleaseDays");
    this.inactiveReleaseDays = readPositiveNumber(inactiveReleaseDays, "inactiveReleaseDays");
    this.frequentReleasesPerYear = readPositiveNumber(
      frequentReleasesPerYear,
      "frequentReleasesPerYear"
    );

    if (this.inactiveReleaseDays <= this.recentReleaseDays) {
      throw new Error("inactiveReleaseDays must be greater than recentReleaseDays.");
    }
  }

  /** Selects the highest supported remediation-delay concern for one finding. */
  evaluate({
    finding,
    packageMetadata = {},
    activity = null,
    updateStrategy = null,
    isProjectRoot = false
  }) {
    const deprecated = !isProjectRoot && (
      finding.type === SmellTypes.DEPRECATED
      || packageMetadata.deprecated === true
      || packageMetadata.allDeprecated === true
      || activity?.installedVersionDeprecated === true
    );
    const archived = packageMetadata.archived === true;
    const activityAge = activity?.daysSinceLatestActivity
      ?? activity?.daysSinceLatestRelease;
    const restrictiveUpdate = [ConstraintKind.PINNED, ConstraintKind.RESTRICTIVE]
      .includes(updateStrategy?.constraintKind);
    const blocksAvailableFix = restrictiveUpdate
      && isFixExcludedByConstraint(finding.evidenceData, updateStrategy);

    if (deprecated || archived) {
      return this.#result(1, deprecated ? "deprecated" : "archived", {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    if (blocksAvailableFix) {
      return this.#result(0.75, "available-fix-blocked-by-constraint", {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    if (activity?.status === "complete"
      && activityAge > this.inactiveReleaseDays) {
      return this.#result(0.75, activityClassification(activity, "stale"), {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    if (restrictiveUpdate) {
      return this.#result(0.5, "restrictive-update-strategy", {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    if (activity?.status === "complete"
      && activityAge <= this.recentReleaseDays
      && Number.isFinite(activity.releasesLastYear)
      && activity.releasesLastYear >= this.frequentReleasesPerYear) {
      return this.#result(0.1, "frequent-active-releases", {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    if (activity?.status === "complete"
      && activityAge <= this.recentReleaseDays) {
      return this.#result(0.25, activityClassification(activity, "recent"), {
        packageMetadata,
        deprecated,
        archived,
        activity,
        updateStrategy,
        blocksAvailableFix
      });
    }

    return this.#result(0.5, activity
      ? activityClassification(activity, "mixed")
      : "metadata-unavailable", {
      packageMetadata,
      deprecated,
      archived,
      activity,
      updateStrategy,
      blocksAvailableFix
    });
  }

  /** Builds concise, auditable evidence for the selected responsiveness value. */
  #result(value, classification, context) {
    return removeUndefinedValues({
      responsivenessValue: value,
      responsivenessClassification: classification,
      responsivenessSources: collectSources(context),
      archived: context.archived,
      deprecated: context.deprecated,
      latestVersion: context.activity?.latestVersion,
      latestReleaseAt: context.activity?.latestReleaseAt,
      daysSinceLatestRelease: context.activity?.daysSinceLatestRelease,
      releasesLastYear: context.activity?.releasesLastYear,
      latestRepositoryActivityAt: context.activity?.activityKind === "repository"
        ? context.activity.latestActivityAt
        : undefined,
      daysSinceLatestRepositoryActivity: context.activity?.activityKind === "repository"
        ? context.activity.daysSinceLatestActivity
        : undefined,
      updateStrategy: context.updateStrategy?.constraintKind,
      declaredConstraint: context.updateStrategy?.declaredConstraint,
      blocksAvailableFix: context.blocksAvailableFix,
      responsivenessThresholds: {
        recentReleaseDays: this.recentReleaseDays,
        inactiveReleaseDays: this.inactiveReleaseDays,
        frequentReleasesPerYear: this.frequentReleasesPerYear
      }
    });
  }
}

/** Names policy outcomes according to whether activity came from npm or GitHub. */
function activityClassification(activity, state) {
  if (activity?.activityKind === "repository") {
    return `${state}-repository-activity`;
  }

  const releaseClassifications = {
    stale: "stale-release-history",
    recent: "recent-active-release",
    mixed: "mixed-release-activity"
  };
  return releaseClassifications[state];
}

/** Confirms that npm's suggested fixed version falls outside the declared range. */
function isFixExcludedByConstraint(evidence = {}, updateStrategy = {}) {
  if (evidence.vulnerabilityFixAvailable !== true) {
    return false;
  }

  const fixVersion = semver.valid(evidence.vulnerabilityFix?.version);
  const declaredRange = semver.validRange(updateStrategy.normalizedRange);
  return Boolean(fixVersion && declaredRange)
    && !semver.satisfies(fixVersion, declaredRange);
}

/** Lists only evidence providers that contributed to the package classification. */
function collectSources({ packageMetadata, activity, updateStrategy, blocksAvailableFix }) {
  const sources = new Set();
  if (packageMetadata?.metadataSource) {
    sources.add(packageMetadata.metadataSource);
  }
  if (activity?.metadataSource) {
    sources.add(activity.metadataSource);
  }
  if (updateStrategy) {
    sources.add("package.json");
  }
  if (blocksAvailableFix) {
    sources.add("npm audit");
  }
  return [...sources];
}

/** Removes unavailable evidence while retaining explicit false and zero values. */
function removeUndefinedValues(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

/** Validates finite positive policy thresholds. */
function readPositiveNumber(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return value;
}
