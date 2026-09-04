import { SmellTypes } from "../../domain/SmellCatalog.js";

const DETECTION_SOURCE = "PackageGovernanceDetector";
const INSTALL_SCRIPT_NAMES = Object.freeze(["preinstall", "install", "postinstall"]);

/** Detects npm lifecycle scripts that can execute while a package is installed. */
export class InstallScriptExecutionRule {
  /** Returns one finding when an exact manifest declares an install lifecycle hook. */
  async evaluate({ node, manifest, metadataSource, metadataScope }) {
    const installScripts = Object.fromEntries(
      INSTALL_SCRIPT_NAMES
        .filter((name) => typeof manifest?.scripts?.[name] === "string")
        .map((name) => [name, manifest.scripts[name]])
    );
    const scriptNames = Object.keys(installScripts);
    if (scriptNames.length === 0) {
      return emptyRuleResult();
    }

    return findingRuleResult({
      type: SmellTypes.INSTALL_SCRIPT_EXECUTION,
      affectedPackage: node.name,
      affectedVersion: node.version,
      detectionSource: DETECTION_SOURCE,
      evidence: `${node.id} declares install lifecycle scripts: ${scriptNames.join(", ")}.`,
      graphContext: { nodeId: node.id },
      evidenceData: {
        scriptNames,
        installScripts,
        metadataSource,
        metadataScope,
        metadataVersion: manifest.version ?? node.version,
        detectionConfidence: "high"
      }
    });
  }
}

/** Detects packages whose npm publisher set exceeds the configured upper bound. */
export class TooManyMaintainersRule {
  /** Returns one heuristic finding when the unique maintainer count is above twenty. */
  constructor({ thresholdPolicy } = {}) {
    this.thresholdPolicy = thresholdPolicy;
  }

  /** Evaluates normalized maintainers from the package's latest npm metadata. */
  async evaluate({ node, manifest, maintainers }) {
    if (!this.thresholdPolicy.hasTooManyMaintainers(maintainers.length)) {
      return emptyRuleResult();
    }

    return findingRuleResult({
      type: SmellTypes.TOO_MANY_MAINTAINERS,
      affectedPackage: node.name,
      affectedVersion: node.version,
      detectionSource: DETECTION_SOURCE,
      evidence: `${node.name} declares ${maintainers.length} npm maintainers, exceeding the threshold of ${this.thresholdPolicy.maxMaintainers}.`,
      graphContext: { nodeId: node.id },
      evidenceData: {
        maintainerCount: maintainers.length,
        maintainerThreshold: this.thresholdPolicy.maxMaintainers,
        metadataSource: "npm Registry",
        metadataScope: "latest package metadata",
        metadataVersion: manifest.version ?? null,
        detectionConfidence: "heuristic"
      }
    });
  }
}

/** Detects packages with at least forty declared contributors per npm maintainer. */
export class TooManyContributorsRule {
  /** Configures the research-derived contributor-to-maintainer ratio policy. */
  constructor({ thresholdPolicy } = {}) {
    this.thresholdPolicy = thresholdPolicy;
  }

  /** Evaluates only explicitly declared npm contributors and never infers missing values. */
  async evaluate({ node, manifest, maintainers, contributors, contributorsDeclared }) {
    if (!contributorsDeclared || maintainers.length === 0) {
      return emptyRuleResult();
    }

    const ratio = contributors.length / maintainers.length;
    if (!this.thresholdPolicy.hasTooManyContributors(maintainers.length, contributors.length)) {
      return emptyRuleResult();
    }

    return findingRuleResult({
      type: SmellTypes.TOO_MANY_CONTRIBUTORS,
      affectedPackage: node.name,
      affectedVersion: node.version,
      detectionSource: DETECTION_SOURCE,
      evidence: `${node.name} declares ${contributors.length} contributors for ${maintainers.length} maintainers (${formatRatio(ratio)} contributors per maintainer).`,
      graphContext: { nodeId: node.id },
      evidenceData: {
        maintainerCount: maintainers.length,
        contributorCount: contributors.length,
        contributorsPerMaintainer: roundRatio(ratio),
        contributorsPerMaintainerThreshold: this.thresholdPolicy.contributorsPerMaintainer,
        metadataSource: "npm Registry",
        metadataScope: "latest package metadata",
        metadataVersion: manifest.version ?? null,
        dataCompleteness: "declared-contributors-only",
        detectionConfidence: "heuristic"
      }
    });
  }
}

/** Detects current npm maintainers whose email domain is confirmed unregistered. */
export class ExpiredMaintainerDomainRule {
  /** Configures domain parsing and independent DNS/RDAP verification modules. */
  constructor({ domainParser, domainVerifier } = {}) {
    this.domainParser = domainParser;
    this.domainVerifier = domainVerifier;
  }

  /** Emits one package finding containing every confirmed unregistered maintainer domain. */
  async evaluate({ node, manifest, maintainers }) {
    const maintainersByDomain = groupMaintainersByDomain(maintainers, this.domainParser);
    const expiredDomains = [];
    const warnings = [];

    for (const [domain, domainMaintainers] of maintainersByDomain) {
      const verification = await this.domainVerifier.verify(domain);
      if (verification.status === "unregistered") {
        expiredDomains.push({
          domain,
          maintainerNames: domainMaintainers.map((person) => person.name).filter(Boolean),
          ...verification
        });
      } else if (verification.status === "unavailable") {
        warnings.push(
          `${node.id}: maintainer domain ${domain} could not be conclusively verified.`
        );
      }
    }

    if (expiredDomains.length === 0) {
      return { finding: null, warnings };
    }

    return {
      finding: {
        type: SmellTypes.EXPIRED_MAINTAINER_DOMAIN,
        affectedPackage: node.name,
        affectedVersion: node.version,
        detectionSource: DETECTION_SOURCE,
        evidence: `${node.name} has npm maintainer email domains confirmed as unregistered: ${expiredDomains.map((item) => item.domain).join(", ")}.`,
        graphContext: { nodeId: node.id },
        evidenceData: {
          expiredMaintainerDomains: expiredDomains,
          metadataSource: "npm Registry + DNS + RDAP",
          metadataScope: "latest package metadata",
          metadataVersion: manifest.version ?? null,
          twoFactorStatus: "unknown",
          detectionConfidence: "high"
        }
      },
      warnings
    };
  }
}

/** Groups maintainers by valid registrable email domain for deduplicated lookups. */
function groupMaintainersByDomain(maintainers, domainParser) {
  const grouped = new Map();

  for (const maintainer of maintainers) {
    const domain = domainParser.parse(maintainer.email);
    if (!domain) {
      continue;
    }

    const values = grouped.get(domain) ?? [];
    values.push(maintainer);
    grouped.set(domain, values);
  }

  return grouped;
}

/** Wraps a finding in the common rule result contract. */
function findingRuleResult(finding) {
  return { finding, warnings: [] };
}

/** Returns the common rule result for a non-matching package. */
function emptyRuleResult() {
  return { finding: null, warnings: [] };
}

/** Rounds evidence ratios to two decimal places without altering threshold comparison. */
function roundRatio(value) {
  return Number(value.toFixed(2));
}

/** Formats evidence ratios consistently for human-readable reports. */
function formatRatio(value) {
  return roundRatio(value).toFixed(2);
}
