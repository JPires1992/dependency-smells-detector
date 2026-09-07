import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { MarkdownReportExporter } from "../src/exporters/MarkdownReportExporter.js";

/** Verifies report metadata and aggregate smell tables against the canonical JSON summary. */
test("MarkdownReportExporter includes analysis metadata and smell summaries", async (context) => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "dependency-smells-markdown-"));
  context.after(() => rm(outputDirectory, { recursive: true, force: true }));
  const exporter = new MarkdownReportExporter();
  const smells = [
    createSmell("SMELL-001", "Deprecated", "High"),
    createSmell("SMELL-002", "No Provenance", "Medium"),
    createSmell("SMELL-003", "No Provenance", "Low")
  ];
  const generatedAt = "2026-09-07T09:30:00.000Z";

  const result = await exporter.export({
    outputDirectory,
    project: {
      name: "sample-app",
      repository: "owner/sample-app",
      packageManager: "npm",
      analysedRef: "main"
    },
    smells,
    warnings: ["Example warning."],
    generatedAt,
    summary: {
      dependenciesAnalysed: 42,
      smellsDetected: 3,
      severityCounts: { Low: 1, Medium: 1, High: 1, Critical: 0 }
    }
  });
  const report = await readFile(result.outputPath, "utf8");

  assert.match(report, new RegExp(`- Analysis date: ${localDateTime(generatedAt)}\\n- Repository:`));
  assert.match(report, /- Dependencies analysed: 42\n- Smells detected: 3/);
  assert.match(report, /## Warnings[\s\S]*- Example warning\.[\s\S]*## Detected Smells/);
  assert.match(report, /### Summary by Severity[\s\S]*\| Critical \| 0 \|[\s\S]*\| High \| 1 \|[\s\S]*\| Medium \| 1 \|[\s\S]*\| Low \| 1 \|/);
  assert.match(report, /### Summary by Smell Type[\s\S]*\| Deprecated \| 1 \|[\s\S]*\| No Provenance \| 2 \|/);
  assert.ok(
    report.indexOf("### Summary by Severity") < report.indexOf("### Summary by Smell Type")
  );
  assert.match(report, /### Smell Details[\s\S]*\| SMELL-001 \| Deprecated \|/);
});

/** Reproduces the expected host-local timestamp used by the Markdown report contract. */
function localDateTime(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  ].join(" ");
}

/** Creates the minimum scored smell required by the Markdown report. */
function createSmell(id, type, finalRating) {
  return {
    id,
    type,
    affectedPackage: "example-package",
    affectedVersion: "1.0.0",
    detectionSource: "TestDetector",
    evidence: "Test evidence.",
    score: {
      finalScore: 50,
      finalRating
    }
  };
}
