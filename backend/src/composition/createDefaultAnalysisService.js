import { AnalysisService } from "../analysis/AnalysisService.js";
import { ProjectInspector } from "../analysis/ProjectInspector.js";
import { DetectorRegistry } from "../detectors/DetectorRegistry.js";
import { CustomSmellDetector } from "../detectors/custom/CustomSmellDetector.js";
import { DirtyWatersAdapter } from "../detectors/dirty-waters/DirtyWatersAdapter.js";
import { PackageGovernanceDetector } from "../detectors/package-governance/PackageGovernanceDetector.js";
import { PeerSpinDetector } from "../detectors/peer-spin/PeerSpinDetector.js";
import { KnipAdapter } from "../detectors/source-usage/KnipAdapter.js";
import { SourceUsageSmellDetector } from "../detectors/source-usage/SourceUsageSmellDetector.js";
import { JsonAnalysisExporter } from "../exporters/JsonAnalysisExporter.js";
import { MarkdownReportExporter } from "../exporters/MarkdownReportExporter.js";
import { NpmRegistryClient } from "../registry/npm/NpmRegistryClient.js";
import { NpmPackageActivityProvider } from "../responsiveness/NpmPackageActivityProvider.js";
import { NpmResponsivenessAnalyzer } from "../responsiveness/NpmResponsivenessAnalyzer.js";
import { ResponsivenessAnalyzerRegistry } from "../responsiveness/ResponsivenessAnalyzerRegistry.js";
import { SsssScorer } from "../scoring/SsssScorer.js";
import { parsePositiveInteger } from "../utils/PositiveInteger.js";
import { NpmAuditVulnerabilityAnalyzer } from "../vulnerabilities/NpmAuditVulnerabilityAnalyzer.js";
import { VulnerabilityAnalyzerRegistry } from "../vulnerabilities/VulnerabilityAnalyzerRegistry.js";

/** Creates the production analysis pipeline from configurable, replaceable module lists. */
export function createDefaultAnalysisService({
  configuration = {},
  inspector = new ProjectInspector(),
  npmRegistryClient = null,
  detectors = null,
  vulnerabilityAnalyzers = null,
  responsivenessAnalyzers = null,
  scorer = new SsssScorer(),
  jsonExporter = new JsonAnalysisExporter(),
  markdownExporter = new MarkdownReportExporter()
} = {}) {
  const sharedNpmRegistryClient = npmRegistryClient
    ?? createDefaultNpmRegistryClient(configuration);

  return new AnalysisService({
    inspector,
    detectorRegistry: new DetectorRegistry(
      detectors ?? createDefaultDetectors(configuration, {
        npmRegistryClient: sharedNpmRegistryClient
      })
    ),
    vulnerabilityAnalyzerRegistry: new VulnerabilityAnalyzerRegistry(
      vulnerabilityAnalyzers ?? createDefaultVulnerabilityAnalyzers(configuration)
    ),
    responsivenessAnalyzerRegistry: new ResponsivenessAnalyzerRegistry(
      responsivenessAnalyzers ?? createDefaultResponsivenessAnalyzers(configuration, {
        npmRegistryClient: sharedNpmRegistryClient
      })
    ),
    scorer,
    jsonExporter,
    markdownExporter
  });
}

/** Builds the ordered detector list while keeping enablement decisions at the composition boundary. */
export function createDefaultDetectors(
  configuration = {},
  { npmRegistryClient = createDefaultNpmRegistryClient(configuration) } = {}
) {
  const detectors = [];
  const dirtyWaters = configuration.dirtyWaters ?? {};
  const packageGovernance = configuration.packageGovernance ?? {};
  const peerSpin = configuration.peerSpin ?? {};
  const sourceUsage = configuration.sourceUsage ?? {};

  if (dirtyWaters.enabled !== false) {
    detectors.push(new DirtyWatersAdapter(withoutEnabled(dirtyWaters)));
  }

  detectors.push(new CustomSmellDetector());

  if (packageGovernance.enabled !== false) {
    detectors.push(new PackageGovernanceDetector({
      metadataProvider: npmRegistryClient,
      ...withoutEnabled(packageGovernance)
    }));
  }

  if (peerSpin.enabled !== false) {
    const {
      enabled: _enabled,
      registryTimeoutMs: _registryTimeoutMs,
      ...detectorOptions
    } = peerSpin;
    detectors.push(new PeerSpinDetector({
      ...detectorOptions,
      metadataProvider: detectorOptions.metadataProvider ?? npmRegistryClient
    }));
  }

  if (sourceUsage.enabled !== false) {
    const {
      enabled: _enabled,
      timeoutMs,
      ...detectorOptions
    } = sourceUsage;
    detectors.push(new SourceUsageSmellDetector({
      ...detectorOptions,
      analyzer: new KnipAdapter({ timeoutMs })
    }));
  }

  return detectors;
}

/** Builds package-manager-specific vulnerability analyzers for the default pipeline. */
export function createDefaultVulnerabilityAnalyzers(configuration = {}) {
  return [new NpmAuditVulnerabilityAnalyzer(configuration.npmAudit)];
}

/** Builds package-manager-specific responsiveness analyzers for the default pipeline. */
export function createDefaultResponsivenessAnalyzers(
  configuration = {},
  { npmRegistryClient = createDefaultNpmRegistryClient(configuration) } = {}
) {
  const options = configuration.responsiveness ?? {};
  return [new NpmResponsivenessAnalyzer({
    ...options,
    activityProvider: options.activityProvider ?? new NpmPackageActivityProvider({
      registryClient: npmRegistryClient
    })
  })];
}

/** Creates the shared npm Registry client while preserving the legacy PeerSpin timeout setting. */
function createDefaultNpmRegistryClient(configuration = {}) {
  const options = configuration.npmRegistry ?? {};
  const timeoutMs = options.timeoutMs
    ?? configuration.peerSpin?.registryTimeoutMs
    ?? parsePositiveInteger(process.env.PEER_SPIN_REGISTRY_TIMEOUT_MS, undefined);

  return new NpmRegistryClient({ ...options, timeoutMs });
}

/** Removes the composition-only enablement flag before constructing a module. */
function withoutEnabled(options) {
  const { enabled: _enabled, ...moduleOptions } = options;
  return moduleOptions;
}
