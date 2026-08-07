#!/usr/bin/env node
import path from "node:path";
import { AnalysisService } from "./analysis/AnalysisService.js";
import { DetectorRegistry } from "./detectors/DetectorRegistry.js";
import { DirtyWatersAdapter, parsePositiveInteger } from "./detectors/dirty-waters/DirtyWatersAdapter.js";
import { CustomSmellDetector } from "./detectors/custom/CustomSmellDetector.js";
import { KnipAdapter } from "./detectors/source-usage/KnipAdapter.js";
import { SourceUsageSmellDetector } from "./detectors/source-usage/SourceUsageSmellDetector.js";

const BOOLEAN_FLAGS = new Set([
  "help",
  "skip-dirty-waters",
  "require-dirty-waters",
  "skip-source-usage",
  "require-source-usage"
]);
const VALUE_FLAGS = new Set([
  "target",
  "t",
  "output",
  "o",
  "ref",
  "dirty-waters-timeout-ms",
  "source-usage-timeout-ms"
]);

/** Entry point that parses CLI arguments and runs the analysis command. */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._[0] === "help") {
    printHelp();
    return;
  }

  const command = args._[0] ?? "analyze";
  if (command !== "analyze") {
    throw new Error(`Unknown command: ${command}`);
  }

  const target = args.target ?? args.t;
  if (!target) {
    throw new Error("Missing required --target <owner/repo>.");
  }

  const outputDirectory = path.resolve(args.output ?? args.o ?? "reports");
  
  // Compose enabled detector modules while keeping CLI options outside detector implementations.
  const detectors = [];
  if (!args["skip-dirty-waters"]) {
    detectors.push(
      new DirtyWatersAdapter({
        required: Boolean(args["require-dirty-waters"]),
        timeoutMs: parsePositiveInteger(args["dirty-waters-timeout-ms"], undefined)
      })
    );
  }
  detectors.push(new CustomSmellDetector());
  if (!args["skip-source-usage"]) {
    detectors.push(
      new SourceUsageSmellDetector({
        required: Boolean(args["require-source-usage"]),
        analyzer: new KnipAdapter({
          timeoutMs: parsePositiveInteger(args["source-usage-timeout-ms"], undefined)
        })
      })
    );
  }

  const service = new AnalysisService({
    detectorRegistry: new DetectorRegistry(detectors)
  });

  const result = await service.analyze({
    target,
    outputDirectory,
    analysedRef: args.ref ?? null,
    githubToken: process.env.GITHUB_API_TOKEN,
    workspaceDirectory: process.cwd()
  });

  console.log(`JSON output: ${result.outputs.json}`);
  console.log(`Markdown report: ${result.outputs.markdown}`);
  console.log(`Smells detected: ${result.summary.smellsDetected}`);
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length}`);
  }
}

/** Parses simple long and short CLI flags into an object consumed by main. */
function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("-")) {
      parsed._.push(token);
      continue;
    }

    const normalized = token.replace(/^-+/, "");
    if (BOOLEAN_FLAGS.has(normalized)) {
      parsed[normalized] = true;
      continue;
    }

    if (!VALUE_FLAGS.has(normalized)) {
      throw new Error(`Unknown option: --${normalized}.`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for --${normalized}.`);
    }

    parsed[normalized] = value;
    index += 1;
  }

  return parsed;
}

/** Prints supported CLI commands, options, and required environment variables. */
function printHelp() {
  console.log(`Usage:
  node src/cli.js analyze --target <owner/repo> [options]

Options:
  --output <dir>              Output directory. Defaults to reports.
  --ref <git-ref>             Analysed ref passed to Dirty-Waters.
  --dirty-waters-timeout-ms <ms>
                              Dirty-Waters execution timeout. Defaults to 1800000.
  --skip-dirty-waters         Run the pipeline without the external adapter.
  --require-dirty-waters      Fail the analysis if Dirty-Waters fails.
  --source-usage-timeout-ms <ms>
                              Knip source analysis timeout. Defaults to 300000.
  --skip-source-usage         Skip unused and missing dependency detection.
  --require-source-usage      Fail the analysis if source-usage detection fails.

Environment:
  GITHUB_API_TOKEN            Required by Dirty-Waters for GitHub API access.
  DIRTY_WATERS_TIMEOUT_MS     Dirty-Waters timeout override in milliseconds.
  DIRTY_WATERS_AUTO_INSTALL   Set to false to disable automatic installation.
  SOURCE_USAGE_TIMEOUT_MS     Knip source analysis timeout override in milliseconds.
  SOURCE_USAGE_DOWNLOAD_TIMEOUT_MS
                              GitHub source archive download timeout. Defaults to 120000.
  SOURCE_USAGE_MAX_ARCHIVE_BYTES
                              Maximum compressed repository archive size.
  SOURCE_USAGE_MAX_EXTRACTED_BYTES
                              Maximum extracted repository size.
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
