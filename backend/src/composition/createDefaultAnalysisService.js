import { AnalysisService } from "../analysis/AnalysisService.js";
import { resolveConfiguration } from "../configuration/ConfigurationLoader.js";
import { GitHubRepositoryWorkspaceProvider } from "../analysis/GitHubRepositoryWorkspaceProvider.js";
import { ProjectInspector } from "../analysis/ProjectInspector.js";
import { DetectorRegistry } from "../detectors/DetectorRegistry.js";
import { CustomSmellDetector } from "../detectors/custom/CustomSmellDetector.js";
import { DirtyWatersAdapter } from "../detectors/dirty-waters/DirtyWatersAdapter.js";
import { DirtyWatersInstaller } from "../detectors/dirty-waters/DirtyWatersInstaller.js";
import { DnsDomainStatusProvider } from "../detectors/package-governance/DnsDomainStatusProvider.js";
import { DomainRegistrationVerifier } from "../detectors/package-governance/DomainRegistrationVerifier.js";
import { PackageGovernanceDetector } from "../detectors/package-governance/PackageGovernanceDetector.js";
import { RdapDomainStatusProvider } from "../detectors/package-governance/RdapDomainStatusProvider.js";
import { PeerSpinDetector } from "../detectors/peer-spin/PeerSpinDetector.js";
import { NodeReplacementConflictDetector } from "../detectors/peer-spin/NodeReplacementConflictDetector.js";
import { KnipAdapter } from "../detectors/source-usage/KnipAdapter.js";
import { SourceUsageSmellDetector } from "../detectors/source-usage/SourceUsageSmellDetector.js";
import { JsonAnalysisExporter } from "../exporters/JsonAnalysisExporter.js";
import { MarkdownReportExporter } from "../exporters/MarkdownReportExporter.js";
import { NpmRegistryClient } from "../registry/npm/NpmRegistryClient.js";
import { NpmPackageActivityProvider } from "../responsiveness/NpmPackageActivityProvider.js";
import { NpmResponsivenessAnalyzer } from "../responsiveness/NpmResponsivenessAnalyzer.js";
import { ResponsivenessAnalyzerRegistry } from "../responsiveness/ResponsivenessAnalyzerRegistry.js";
import { SsssScorer } from "../scoring/SsssScorer.js";
import { GitHubAdvisoryClient } from "../vulnerabilities/GitHubAdvisoryClient.js";
import { NpmAuditVulnerabilityAnalyzer } from "../vulnerabilities/NpmAuditVulnerabilityAnalyzer.js";
import { VulnerabilityPersistenceEnricher } from "../vulnerabilities/VulnerabilityPersistenceEnricher.js";
import { VulnerabilityAnalyzerRegistry } from "../vulnerabilities/VulnerabilityAnalyzerRegistry.js";

/** Creates the production analysis pipeline from configurable, replaceable module lists. */
export function createDefaultAnalysisService({
  configuration = {},
  credentials = {},
  inspector = new ProjectInspector(),
  npmRegistryClient = null,
  githubAdvisoryClient = null,
  detectors = null,
  vulnerabilityAnalyzers = null,
  responsivenessAnalyzers = null,
  scorer = new SsssScorer(),
  jsonExporter = null,
  markdownExporter = new MarkdownReportExporter()
} = {}) {
  const resolvedConfiguration = resolveConfiguration(configuration);
  const sharedNpmRegistryClient = npmRegistryClient
    ?? createDefaultNpmRegistryClient(resolvedConfiguration, credentials);

  return new AnalysisService({
    inspector,
    detectorRegistry: new DetectorRegistry(
      detectors ?? createDefaultDetectors(resolvedConfiguration, {
        npmRegistryClient: sharedNpmRegistryClient
      })
    ),
    vulnerabilityAnalyzerRegistry: new VulnerabilityAnalyzerRegistry(
      vulnerabilityAnalyzers ?? createDefaultVulnerabilityAnalyzers(resolvedConfiguration, {
        githubAdvisoryClient,
        credentials
      })
    ),
    responsivenessAnalyzerRegistry: new ResponsivenessAnalyzerRegistry(
      responsivenessAnalyzers ?? createDefaultResponsivenessAnalyzers(resolvedConfiguration, {
        npmRegistryClient: sharedNpmRegistryClient
      })
    ),
    scorer,
    jsonExporter: jsonExporter ?? new JsonAnalysisExporter(resolvedConfiguration.output),
    markdownExporter
  });
}

/** Builds the ordered detector list while keeping enablement decisions at the composition boundary. */
export function createDefaultDetectors(
  configuration = {},
  { npmRegistryClient = null } = {}
) {
  const resolvedConfiguration = resolveConfiguration(configuration);
  const sharedNpmRegistryClient = npmRegistryClient
    ?? createDefaultNpmRegistryClient(resolvedConfiguration);
  const detectors = [];
  const dirtyWaters = resolvedConfiguration.dirtyWaters;
  const packageGovernance = resolvedConfiguration.packageGovernance;
  const peerSpin = resolvedConfiguration.peerSpin;
  const sourceUsage = resolvedConfiguration.sourceUsage;

  if (dirtyWaters.enabled !== false) {
    const {
      enabled: _enabled,
      executable,
      pipCommand,
      installSource,
      autoInstall,
      ...adapterOptions
    } = dirtyWaters;
    detectors.push(new DirtyWatersAdapter({
      ...adapterOptions,
      installer: new DirtyWatersInstaller({
        executable,
        pipCommand,
        installSource,
        autoInstall
      })
    }));
  }

  detectors.push(new CustomSmellDetector());

  if (packageGovernance.enabled !== false) {
    const domainLookup = resolvedConfiguration.domainLookup;
    detectors.push(new PackageGovernanceDetector({
      metadataProvider: sharedNpmRegistryClient,
      domainVerifier: new DomainRegistrationVerifier({
        dnsProvider: new DnsDomainStatusProvider({ timeoutMs: domainLookup.dnsTimeoutMs }),
        rdapProvider: new RdapDomainStatusProvider({
          timeoutMs: domainLookup.rdapTimeoutMs,
          bootstrapUrl: domainLookup.rdapBootstrapUrl
        })
      }),
      ...withoutEnabled(packageGovernance)
    }));
  }

  if (peerSpin.enabled !== false) {
    const {
      enabled: _enabled,
      maxTraversalNodes,
      ...detectorOptions
    } = peerSpin;
    detectors.push(new PeerSpinDetector({
      ...detectorOptions,
      conflictDetector: new NodeReplacementConflictDetector({
        maxTraversalNodes
      }),
      metadataProvider: sharedNpmRegistryClient
    }));
  }

  if (sourceUsage.enabled !== false) {
    const {
      enabled: _enabled,
      timeoutMs,
      downloadTimeoutMs,
      maxArchiveBytes,
      maxExtractedBytes,
      ...detectorOptions
    } = sourceUsage;
    detectors.push(new SourceUsageSmellDetector({
      ...detectorOptions,
      analyzer: new KnipAdapter({ timeoutMs }),
      workspaceProvider: new GitHubRepositoryWorkspaceProvider({
        downloadTimeoutMs,
        maxArchiveBytes,
        maxExtractedBytes
      })
    }));
  }

  return detectors;
}

/** Builds package-manager-specific vulnerability analyzers for the default pipeline. */
export function createDefaultVulnerabilityAnalyzers(
  configuration = {},
  { githubAdvisoryClient = null, credentials = {} } = {}
) {
  const resolvedConfiguration = resolveConfiguration(configuration);
  const { concurrency, ...clientOptions } = resolvedConfiguration.githubAdvisories;
  const sharedGitHubAdvisoryClient = githubAdvisoryClient ?? new GitHubAdvisoryClient({
    ...clientOptions,
    token: credentials.githubToken ?? null
  });

  return [new NpmAuditVulnerabilityAnalyzer({
    ...resolvedConfiguration.npmAudit,
    persistenceEnricher: new VulnerabilityPersistenceEnricher({
      advisoryProvider: sharedGitHubAdvisoryClient,
      concurrency
    })
  })];
}

/** Builds package-manager-specific responsiveness analyzers for the default pipeline. */
export function createDefaultResponsivenessAnalyzers(
  configuration = {},
  { npmRegistryClient = null } = {}
) {
  const resolvedConfiguration = resolveConfiguration(configuration);
  const sharedNpmRegistryClient = npmRegistryClient
    ?? createDefaultNpmRegistryClient(resolvedConfiguration);
  const options = resolvedConfiguration.responsiveness;
  return [new NpmResponsivenessAnalyzer({
    ...options,
    activityProvider: new NpmPackageActivityProvider({
      registryClient: sharedNpmRegistryClient
    })
  })];
}

/** Creates the shared npm Registry client with separately supplied credentials. */
function createDefaultNpmRegistryClient(configuration = {}, credentials = {}) {
  const resolvedConfiguration = resolveConfiguration(configuration);
  const options = resolvedConfiguration.npmRegistry;
  return new NpmRegistryClient({
    ...options,
    token: credentials.npmRegistryToken ?? null
  });
}

/** Removes the composition-only enablement flag before constructing a module. */
function withoutEnabled(options) {
  const { enabled: _enabled, ...moduleOptions } = options;
  return moduleOptions;
}
