/** Published prototype thresholds for npm package governance smell rules. */
export class GovernanceThresholdPolicy {
  /** Configures independently adjustable maintainer and contributor thresholds. */
  constructor({
    maxMaintainers = 20,
    contributorsPerMaintainer = 40
  } = {}) {
    this.maxMaintainers = readNonNegativeNumber(maxMaintainers, "maxMaintainers");
    this.contributorsPerMaintainer = readPositiveNumber(
      contributorsPerMaintainer,
      "contributorsPerMaintainer"
    );
  }

  /** Returns true when a package has more than the accepted maintainer count. */
  hasTooManyMaintainers(maintainerCount) {
    return maintainerCount > this.maxMaintainers;
  }

  /** Returns true when each maintainer is responsible for at least forty contributors. */
  hasTooManyContributors(maintainerCount, contributorCount) {
    return maintainerCount > 0
      && contributorCount / maintainerCount >= this.contributorsPerMaintainer;
  }
}

/** Validates a finite threshold that may legitimately be zero. */
function readNonNegativeNumber(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number.`);
  }
  return value;
}

/** Validates a finite threshold used as a positive divisor or ratio. */
function readPositiveNumber(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return value;
}
