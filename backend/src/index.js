/** Public module surface for the Analysis and Scoring Layer. */
export { AnalysisService } from "./analysis/AnalysisService.js";
export { ProjectInspector } from "./analysis/ProjectInspector.js";
export { DetectorRegistry } from "./detectors/DetectorRegistry.js";
export { DirtyWatersAdapter } from "./detectors/dirty-waters/DirtyWatersAdapter.js";
export { DirtyWatersOutputParser } from "./detectors/dirty-waters/DirtyWatersOutputParser.js";
export { CustomSmellDetector } from "./detectors/custom/CustomSmellDetector.js";
export { NpmDependencySpecifierParser } from "./detectors/custom/NpmDependencySpecifierParser.js";
export { SourceUsageSmellDetector } from "./detectors/source-usage/SourceUsageSmellDetector.js";
export { KnipAdapter } from "./detectors/source-usage/KnipAdapter.js";
export { KnipOutputParser } from "./detectors/source-usage/KnipOutputParser.js";
export { DEFAULT_PACKAGE_MANAGER } from "./domain/PackageManager.js";
export { SsssScorer } from "./scoring/SsssScorer.js";
export { VulnerabilityAnalyzerRegistry } from "./vulnerabilities/VulnerabilityAnalyzerRegistry.js";
export { NpmAuditVulnerabilityAnalyzer } from "./vulnerabilities/NpmAuditVulnerabilityAnalyzer.js";
export { JsonAnalysisExporter } from "./exporters/JsonAnalysisExporter.js";
export { MarkdownReportExporter } from "./exporters/MarkdownReportExporter.js";
