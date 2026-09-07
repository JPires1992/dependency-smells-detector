import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SEVERITY_ORDER = Object.freeze(["Critical", "High", "Medium", "Low"]);

/** Writes a concise Markdown analysis report for developers and CI/CD artefacts. */
export class MarkdownReportExporter {
  /** Serializes scored smells into a Markdown report file. */
  async export({
    outputDirectory,
    fileName = "analysis-report.md",
    project,
    smells,
    warnings = [],
    generatedAt = new Date().toISOString(),
    summary = null
  }) {
    await mkdir(outputDirectory, { recursive: true });
    const outputPath = path.join(outputDirectory, fileName);
    await writeFile(
      outputPath,
      buildMarkdownReport({ project, smells, warnings, generatedAt, summary }),
      "utf8"
    );
    return { outputPath };
  }
}

/** Builds the Markdown report body from project metadata, warnings, and scored smells. */
function buildMarkdownReport({ project, smells, warnings, generatedAt, summary }) {
  const resolvedSummary = resolveSummary(summary, smells);
  const lines = [
    `# Software Supply Chain Smell Report - ${project.name}`,
    "",
    `- Analysis date: ${formatLocalDateTime(generatedAt)}`,
    `- Repository: ${project.repository ?? "not available"}`,
    `- Package manager: ${project.packageManager}`,
    `- Analysed ref: ${project.analysedRef ?? "not specified"}`,
    `- Dependencies analysed: ${resolvedSummary.dependenciesAnalysed}`,
    `- Smells detected: ${resolvedSummary.smellsDetected}`,
    ""
  ];

  if (warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push("");
  }

  lines.push("## Detected Smells", "");
  if (smells.length === 0) {
    lines.push("No smell instances were detected.", "");
    return `${lines.join("\n")}\n`;
  }

  appendSeveritySummary(lines, resolvedSummary.severityCounts);
  appendSmellTypeSummary(lines, smells);
  lines.push("### Smell Details", "");
  lines.push("| ID | Smell | Package | Score | Rating | Source | Evidence |");
  lines.push("| --- | --- | --- | ---: | --- | --- | --- |");

  for (const smell of smells) {
    lines.push(
      [
        smell.id,
        smell.type,
        formatPackage(smell),
        smell.score.finalScore.toFixed(2),
        smell.score.finalRating,
        smell.detectionSource,
        sanitizeMarkdownCell(smell.evidence)
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |")
    );
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

/** Uses the canonical JSON summary while retaining safe standalone exporter defaults. */
function resolveSummary(summary, smells) {
  return {
    dependenciesAnalysed: Number.isInteger(summary?.dependenciesAnalysed)
      ? summary.dependenciesAnalysed
      : "not available",
    smellsDetected: Number.isInteger(summary?.smellsDetected)
      ? summary.smellsDetected
      : smells.length,
    severityCounts: summary?.severityCounts ?? countSmellsBySeverity(smells)
  };
}

/** Appends severity totals in descending priority order. */
function appendSeveritySummary(lines, severityCounts) {
  lines.push("### Summary by Severity", "");
  lines.push("| Severity | Total |");
  lines.push("| --- | ---: |");
  for (const severity of SEVERITY_ORDER) {
    lines.push(`| ${severity} | ${severityCounts[severity] ?? 0} |`);
  }
  lines.push("");
}

/** Appends an alphabetically ordered count for every smell type present in the report. */
function appendSmellTypeSummary(lines, smells) {
  const counts = new Map();
  for (const smell of smells) {
    counts.set(smell.type, (counts.get(smell.type) ?? 0) + 1);
  }

  lines.push("### Summary by Smell Type", "");
  lines.push("| Smell Type | Total |");
  lines.push("| --- | ---: |");
  for (const [type, total] of [...counts.entries()].sort(([left], [right]) => (
    left.localeCompare(right)
  ))) {
    lines.push(`| ${sanitizeMarkdownCell(type)} | ${total} |`);
  }
  lines.push("");
}

/** Calculates severity totals when the exporter is used without the JSON summary. */
function countSmellsBySeverity(smells) {
  const counts = Object.fromEntries(SEVERITY_ORDER.map((severity) => [severity, 0]));
  for (const smell of smells) {
    const rating = smell.score?.finalRating;
    if (Object.hasOwn(counts, rating)) {
      counts[rating] += 1;
    }
  }
  return counts;
}

/** Formats an analysis timestamp in the backend host's local time without a UTC suffix. */
function formatLocalDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "not available";
  }

  const parts = [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ];
  const time = [
    padDatePart(date.getHours()),
    padDatePart(date.getMinutes()),
    padDatePart(date.getSeconds())
  ];
  return `${parts.join("-")} ${time.join(":")}`;
}

/** Pads local date and time components to a stable two-digit representation. */
function padDatePart(value) {
  return String(value).padStart(2, "0");
}

/** Formats a smell package target using name and version when both are available. */
function formatPackage(smell) {
  return smell.affectedVersion ? `${smell.affectedPackage}@${smell.affectedVersion}` : smell.affectedPackage;
}

/** Escapes table separators and collapses whitespace inside Markdown table cells. */
function sanitizeMarkdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}
