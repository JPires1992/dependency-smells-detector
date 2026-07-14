#!/usr/bin/env node
import path from "node:path";
import { AnalysisService } from "./analysis/AnalysisService.js";
import { DetectorRegistry } from "./detectors/DetectorRegistry.js";
import { DirtyWatersAdapter, parsePositiveInteger } from "./detectors/dirty-waters/DirtyWatersAdapter.js";
import { CustomDetectorPlaceholder } from "./detectors/custom/CustomDetectorPlaceholder.js";

const BOOLEAN_FLAGS = new Set(["help", "skip-dirty-waters", "require-dirty-waters"]);
const VALUE_FLAGS = new Set(["target", "t", "output", "o", "github-repo", "ref", "dirty-waters-timeout-ms"]);

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
    throw new Error("Missing required --target <path-or-owner/repo>.");
  }

  const outputDirectory = path.resolve(args.output ?? args.o ?? "reports");
  
  // Initialize the detector registry with the Dirty-Waters adapter and any custom detectors.
  const detectors = [];
  if (!args["skip-dirty-waters"]) {
    detectors.push(
      new DirtyWatersAdapter({
        required: Boolean(args["require-dirty-waters"]),
        timeoutMs: parsePositiveInteger(args["dirty-waters-timeout-ms"], undefined)
      })
    );
  }
  detectors.push(new CustomDetectorPlaceholder());

  const service = new AnalysisService({
    detectorRegistry: new DetectorRegistry(detectors)
  });

  const result = await service.analyze({
    target,
    outputDirectory,
    githubRepository: args["github-repo"] ?? process.env.GITHUB_REPOSITORY_PATH ?? null,
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
  node src/cli.js analyze --target <path-or-owner/repo> [options]

Options:
  --output <dir>              Output directory. Defaults to reports.
  --github-repo <owner/repo>  GitHub path used by Dirty-Waters.
  --ref <git-ref>             Analysed ref passed to Dirty-Waters.
  --dirty-waters-timeout-ms <ms>
                              Dirty-Waters execution timeout. Defaults to 1800000.
  --skip-dirty-waters         Run the pipeline without the external adapter.
  --require-dirty-waters      Fail the analysis if Dirty-Waters fails.

Environment:
  GITHUB_API_TOKEN            Required by Dirty-Waters for GitHub API access.
  GITHUB_REPOSITORY_PATH      Fallback owner/repo path for local project analysis.
  DIRTY_WATERS_TIMEOUT_MS     Dirty-Waters timeout override in milliseconds.
  DIRTY_WATERS_AUTO_INSTALL   Set to false to disable automatic installation.
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
