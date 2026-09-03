#!/usr/bin/env node
import path from "node:path";
import { AnalysisService } from "./analysis/AnalysisService.js";
import { DetectorRegistry } from "./detectors/DetectorRegistry.js";
import { DirtyWatersAdapter, parsePositiveInteger } from "./detectors/dirty-waters/DirtyWatersAdapter.js";
import { CustomSmellDetector } from "./detectors/custom/CustomSmellDetector.js";
import { KnipAdapter } from "./detectors/source-usage/KnipAdapter.js";
import { SourceUsageSmellDetector } from "./detectors/source-usage/SourceUsageSmellDetector.js";
import { NpmRegistryMetadataProvider } from "./detectors/peer-spin/NpmRegistryMetadataProvider.js";
import { PeerSpinDetector } from "./detectors/peer-spin/PeerSpinDetector.js";
import { PackageGovernanceDetector } from "./detectors/package-governance/PackageGovernanceDetector.js";
import { ResponsivenessAnalyzerRegistry } from "./responsiveness/ResponsivenessAnalyzerRegistry.js";
import { NpmResponsivenessAnalyzer } from "./responsiveness/NpmResponsivenessAnalyzer.js";

const BOOLEAN_FLAGS = new Set([
  "help",
  "skip-dirty-waters",
  "require-dirty-waters",
  "skip-package-governance",
  "require-package-governance",
  "require-responsiveness",
  "skip-peer-spin",
  "require-peer-spin",
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
  "package-governance-concurrency",
  "responsiveness-concurrency",
  "peer-spin-registry-timeout-ms",
  "peer-spin-registry-concurrency",
  "peer-spin-max-conflicts",
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
  if (!args["skip-package-governance"]) {
    detectors.push(
      new PackageGovernanceDetector({
        required: Boolean(args["require-package-governance"]),
        concurrency: parsePositiveInteger(
          args["package-governance-concurrency"],
          undefined
        )
      })
    );
  }
  if (!args["skip-peer-spin"]) {
    detectors.push(
      new PeerSpinDetector({
        required: Boolean(args["require-peer-spin"]),
        maxConflicts: parsePositiveInteger(args["peer-spin-max-conflicts"], undefined),
        verificationConcurrency: parsePositiveInteger(
          args["peer-spin-registry-concurrency"],
          undefined
        ),
        metadataProvider: new NpmRegistryMetadataProvider({
          timeoutMs: parsePositiveInteger(
            args["peer-spin-registry-timeout-ms"],
            undefined
          )
        })
      })
    );
  }
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
    detectorRegistry: new DetectorRegistry(detectors),
    responsivenessAnalyzerRegistry: new ResponsivenessAnalyzerRegistry([
      new NpmResponsivenessAnalyzer({
        required: Boolean(args["require-responsiveness"]),
        concurrency: parsePositiveInteger(args["responsiveness-concurrency"], undefined)
      })
    ])
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
  --package-governance-concurrency <count>
                              Concurrent npm metadata analyses. Defaults to 4.
  --skip-package-governance   Skip npm package governance metadata detection.
  --require-package-governance
                              Fail the analysis if package metadata cannot be retrieved.
  --responsiveness-concurrency <count>
                              Concurrent npm release-history lookups. Defaults to 4.
  --require-responsiveness    Fail when npm responsiveness evidence cannot be retrieved.
  --peer-spin-registry-timeout-ms <ms>
                              Timeout for each npm registry verification. Defaults to 30000.
  --peer-spin-max-conflicts <count>
                              Maximum PeerSpin candidates verified per analysis. Defaults to 100.
  --peer-spin-registry-concurrency <count>
                              Concurrent registry verifications. Defaults to 4.
  --skip-peer-spin            Skip PeerSpin dependency-resolution detection.
  --require-peer-spin         Fail the analysis if PeerSpin detection fails.
  --source-usage-timeout-ms <ms>
                              Knip source analysis timeout. Defaults to 300000.
  --skip-source-usage         Skip unused and missing dependency detection.
  --require-source-usage      Fail the analysis if source-usage detection fails.

Environment:
  GITHUB_API_TOKEN            Required by Dirty-Waters for GitHub API access.
  DIRTY_WATERS_TIMEOUT_MS     Dirty-Waters timeout override in milliseconds.
  DIRTY_WATERS_AUTO_INSTALL   Set to false to disable automatic installation.
  NPM_REGISTRY_URL            Registry used for package metadata and PeerSpin verification.
  NPM_REGISTRY_TOKEN          Optional bearer token for private registry packages.
  NPM_REGISTRY_TIMEOUT_MS     Package governance registry timeout. Defaults to 30000.
  PACKAGE_GOVERNANCE_CONCURRENCY
                              Concurrent package governance analyses. Defaults to 4.
  RESPONSIVENESS_CONCURRENCY  Concurrent npm release-history lookups. Defaults to 4.
  DOMAIN_LOOKUP_TIMEOUT_MS    Timeout for each DNS and RDAP lookup. Defaults to 10000/15000.
  PEER_SPIN_REGISTRY_TIMEOUT_MS
                              Registry verification timeout. Defaults to 30000.
  PEER_SPIN_MAX_CONFLICTS     Maximum conflicts verified per analysis. Defaults to 100.
  PEER_SPIN_REGISTRY_CONCURRENCY
                              Concurrent registry verifications. Defaults to 4.
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
