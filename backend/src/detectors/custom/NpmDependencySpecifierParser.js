import npa from "npm-package-arg";
import semver from "semver";

/** Normalized dependency constraint categories consumed by independent custom smell rules. */
export const ConstraintKind = Object.freeze({
  PINNED: "pinned",
  RESTRICTIVE: "restrictive",
  PERMISSIVE: "permissive",
  COMPATIBLE: "compatible",
  NOT_APPLICABLE: "not-applicable",
  UNKNOWN: "unknown"
});

/** Normalized dependency source categories independent from npm-package-arg internals. */
export const SpecifierSource = Object.freeze({
  REGISTRY: "registry",
  URL: "url",
  LOCAL: "local",
  ALIAS: "alias",
  WORKSPACE: "workspace",
  UNKNOWN: "unknown"
});

/** Parses npm dependency specifiers and classifies their update behavior against SemVer. */
export class NpmDependencySpecifierParser {
  /** Returns a stable specifier model without propagating malformed manifest entries. */
  parse(packageName, rawSpecifier) {
    const raw = String(rawSpecifier ?? "").trim();
    if (raw.startsWith("workspace:")) {
      return createSpecifierModel(raw, {
        source: SpecifierSource.WORKSPACE,
        constraintKind: ConstraintKind.NOT_APPLICABLE,
        parserType: "workspace"
      });
    }

    let parsed;
    try {
      parsed = npa.resolve(packageName, raw || "*");
    } catch (error) {
      return createSpecifierModel(raw, {
        source: SpecifierSource.UNKNOWN,
        constraintKind: ConstraintKind.UNKNOWN,
        parserType: "invalid",
        parseError: error.message
      });
    }

    if (["git", "remote"].includes(parsed.type)) {
      return createSpecifierModel(raw, {
        source: SpecifierSource.URL,
        constraintKind: ConstraintKind.NOT_APPLICABLE,
        parserType: parsed.type
      });
    }

    if (["file", "directory"].includes(parsed.type)) {
      return createSpecifierModel(raw, {
        source: SpecifierSource.LOCAL,
        constraintKind: ConstraintKind.NOT_APPLICABLE,
        parserType: parsed.type
      });
    }

    if (parsed.type === "alias") {
      return createSpecifierModel(raw, {
        source: SpecifierSource.ALIAS,
        constraintKind: ConstraintKind.NOT_APPLICABLE,
        parserType: parsed.type
      });
    }

    if (parsed.type === "tag") {
      return createSpecifierModel(raw, {
        source: SpecifierSource.REGISTRY,
        constraintKind: ConstraintKind.PERMISSIVE,
        parserType: parsed.type
      });
    }

    return createSpecifierModel(raw, {
      source: SpecifierSource.REGISTRY,
      parserType: parsed.type,
      ...classifyRegistryConstraint(parsed)
    });
  }
}

/** Classifies registry versions and ranges using the same-major compatibility interval. */
function classifyRegistryConstraint(parsed) {
  const normalizedRange = semver.validRange(parsed.fetchSpec);
  const minimumVersion = normalizedRange ? semver.minVersion(normalizedRange) : null;
  if (!normalizedRange || !minimumVersion) {
    return {
      constraintKind: ConstraintKind.UNKNOWN,
      normalizedRange,
      minimumVersion: minimumVersion?.version ?? null,
      recommendedRange: null
    };
  }

  if (parsed.type === "version") {
    return {
      constraintKind: ConstraintKind.PINNED,
      normalizedRange,
      minimumVersion: minimumVersion.version,
      recommendedRange: null
    };
  }

  if (isExclusivelyUpperBoundedRange(normalizedRange)) {
    return {
      constraintKind: ConstraintKind.RESTRICTIVE,
      normalizedRange,
      minimumVersion: minimumVersion.version,
      recommendedRange: null
    };
  }

  const recommendedRange = sameMajorRangeFor(minimumVersion);
  const declaredIsSubset = semver.subset(normalizedRange, recommendedRange);
  const recommendedIsSubset = semver.subset(recommendedRange, normalizedRange);
  let constraintKind = ConstraintKind.PERMISSIVE;

  if (declaredIsSubset && recommendedIsSubset) {
    constraintKind = ConstraintKind.COMPATIBLE;
  } else if (declaredIsSubset) {
    constraintKind = ConstraintKind.RESTRICTIVE;
  }

  return {
    constraintKind,
    normalizedRange,
    minimumVersion: minimumVersion.version,
    recommendedRange
  };
}

/** Returns the broadest range that stays within the minimum version's major line. */
function sameMajorRangeFor(version) {
  return `>=${version.version} <${version.major + 1}.0.0-0`;
}

/** Detects range alternatives that impose an upper bound without declaring a lower bound. */
function isExclusivelyUpperBoundedRange(normalizedRange) {
  const comparatorSets = new semver.Range(normalizedRange).set;

  return comparatorSets.length > 0 && comparatorSets.every((comparators) => {
    const operators = comparators
      .map((comparator) => comparator.operator)
      .filter(Boolean);
    const hasUpperBound = operators.some((operator) => operator === "<" || operator === "<=");
    const hasLowerBound = operators.some((operator) => operator === ">" || operator === ">=");

    return hasUpperBound && !hasLowerBound;
  });
}

/** Creates a complete normalized parser result with safe defaults for optional metadata. */
function createSpecifierModel(raw, details) {
  return {
    raw,
    source: details.source ?? SpecifierSource.UNKNOWN,
    constraintKind: details.constraintKind ?? ConstraintKind.UNKNOWN,
    parserType: details.parserType ?? "unknown",
    normalizedRange: details.normalizedRange ?? null,
    minimumVersion: details.minimumVersion ?? null,
    recommendedRange: details.recommendedRange ?? null,
    parseError: details.parseError ?? null
  };
}
