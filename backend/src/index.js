/** Public module surface for the Analysis and Scoring Layer. */
export { AnalysisService } from "./analysis/AnalysisService.js";
export { ProjectInspector } from "./analysis/ProjectInspector.js";
export { DetectorRegistry } from "./detectors/DetectorRegistry.js";
export { DirtyWatersAdapter } from "./detectors/dirty-waters/DirtyWatersAdapter.js";
export { DirtyWatersOutputParser } from "./detectors/dirty-waters/DirtyWatersOutputParser.js";
export { DEFAULT_PACKAGE_MANAGER } from "./domain/PackageManager.js";
export { SsssScorer } from "./scoring/SsssScorer.js";
export { VulnerabilityAnalyzerRegistry } from "./vulnerabilities/VulnerabilityAnalyzerRegistry.js";
export { NpmAuditVulnerabilityAnalyzer } from "./vulnerabilities/NpmAuditVulnerabilityAnalyzer.js";
export { JsonAnalysisExporter } from "./exporters/JsonAnalysisExporter.js";
export { MarkdownReportExporter } from "./exporters/MarkdownReportExporter.js";
