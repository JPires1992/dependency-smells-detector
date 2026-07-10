import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** Writes a concise Markdown analysis report for developers and CI/CD artefacts. */
export class MarkdownReportExporter {
  /** Serializes scored smells into a Markdown report file. */
  async export({ outputDirectory, fileName = "analysis-report.md", project, smells, warnings = [] }) {
    await mkdir(outputDirectory, { recursive: true });
    const outputPath = path.join(outputDirectory, fileName);
    await writeFile(outputPath, buildMarkdownReport(project, smells, warnings), "utf8");
    return { outputPath };
  }
}

/** Builds the Markdown report body from project metadata, warnings, and scored smells. */
function buildMarkdownReport(project, smells, warnings) {
  const lines = [
    `# Software Supply Chain Smell Report - ${project.name}`,
    "",
    `- Repository: ${project.repository ?? "not available"}`,
    `- Package manager: ${project.packageManager}`,
    `- Analysed ref: ${project.analysedRef ?? "not specified"}`,
    `- Smells detected: ${smells.length}`,
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

/** Formats a smell package target using name and version when both are available. */
function formatPackage(smell) {
  return smell.affectedVersion ? `${smell.affectedPackage}@${smell.affectedVersion}` : smell.affectedPackage;
}

/** Escapes table separators and collapses whitespace inside Markdown table cells. */
function sanitizeMarkdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}
