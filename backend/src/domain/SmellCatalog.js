/** Canonical smell names used across detectors, scoring, and exporters. */
export const SmellTypes = Object.freeze({
  PINNED_DEPENDENCY: "Pinned Dependency",
  HARDCODED_URL: "Hardcoded URL",
  RESTRICTIVE_CONSTRAINT: "Restrictive Constraint",
  PERMISSIVE_CONSTRAINT: "Permissive Constraint",
  NO_PACKAGE_LOCK: "No Package-Lock",
  UNUSED_DEPENDENCY: "Unused Dependency",
  MISSING_DEPENDENCY: "Missing Dependency",
  PEER_DEPENDENCY_RESOLVING_LOOP: "Peer Dependency Resolving Loop (PeerSpin)",
  NO_SOURCE_CODE_URL: "No Source Code URL",
  INVALID_SOURCE_CODE_URL: "Invalid Source Code URL",
  INACCESSIBLE_COMMIT_SHA_OR_RELEASE_TAG: "Inaccessible Commit SHA/Release Tag",
  DEPRECATED: "Deprecated",
  FORK: "Fork",
  NO_CODE_SIGNATURE: "No Code Signature",
  INVALID_CODE_SIGNATURE: "Invalid Code Signature",
  NO_PROVENANCE: "No Provenance",
  ALIASED: "Aliased",
  EXPIRED_MAINTAINER_DOMAIN: "Expired Maintainer Domain",
  INSTALL_SCRIPT_EXECUTION: "Install Script Execution",
  TOO_MANY_MAINTAINERS: "Too Many Maintainers",
  TOO_MANY_CONTRIBUTORS: "Too Many Contributors"
});

/** Qualitative severity labels used by baseline and final SSSS ratings. */
export const BaselineSeverity = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
});

/** Maps each smell type to the baseline severity defined in the dissertation catalogue. */
export const BASELINE_SEVERITY_BY_SMELL = Object.freeze({
  [SmellTypes.PINNED_DEPENDENCY]: BaselineSeverity.MEDIUM,
  [SmellTypes.HARDCODED_URL]: BaselineSeverity.HIGH,
  [SmellTypes.RESTRICTIVE_CONSTRAINT]: BaselineSeverity.HIGH,
  [SmellTypes.PERMISSIVE_CONSTRAINT]: BaselineSeverity.MEDIUM,
  [SmellTypes.NO_PACKAGE_LOCK]: BaselineSeverity.MEDIUM,
  [SmellTypes.UNUSED_DEPENDENCY]: BaselineSeverity.LOW,
  [SmellTypes.MISSING_DEPENDENCY]: BaselineSeverity.MEDIUM,
  [SmellTypes.PEER_DEPENDENCY_RESOLVING_LOOP]: BaselineSeverity.HIGH,
  [SmellTypes.NO_SOURCE_CODE_URL]: BaselineSeverity.HIGH,
  [SmellTypes.INVALID_SOURCE_CODE_URL]: BaselineSeverity.HIGH,
  [SmellTypes.INACCESSIBLE_COMMIT_SHA_OR_RELEASE_TAG]: BaselineSeverity.HIGH,
  [SmellTypes.DEPRECATED]: BaselineSeverity.HIGH,
  [SmellTypes.FORK]: BaselineSeverity.MEDIUM,
  [SmellTypes.NO_CODE_SIGNATURE]: BaselineSeverity.HIGH,
  [SmellTypes.INVALID_CODE_SIGNATURE]: BaselineSeverity.CRITICAL,
  [SmellTypes.NO_PROVENANCE]: BaselineSeverity.LOW,
  [SmellTypes.ALIASED]: BaselineSeverity.LOW,
  [SmellTypes.EXPIRED_MAINTAINER_DOMAIN]: BaselineSeverity.CRITICAL,
  [SmellTypes.INSTALL_SCRIPT_EXECUTION]: BaselineSeverity.CRITICAL,
  [SmellTypes.TOO_MANY_MAINTAINERS]: BaselineSeverity.MEDIUM,
  [SmellTypes.TOO_MANY_CONTRIBUTORS]: BaselineSeverity.LOW
});