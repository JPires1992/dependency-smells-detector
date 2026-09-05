#!/usr/bin/env node
import path from "node:path";
import { createDefaultAnalysisService } from "./composition/createDefaultAnalysisService.js";
import {
  loadConfiguration,
  resolveConfiguration
} from "./configuration/ConfigurationLoader.js";
import { parsePositiveInteger } from "./utils/PositiveInteger.js";

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
  "config",
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
  const { configuration, credentials } = await loadConfiguration({
    configPath: args.config ? path.resolve(args.config) : null,
    env: process.env,
    cliOverrides: buildCliConfiguration(args)
  });

  const service = createDefaultAnalysisService({
    configuration,
    credentials
  });

  const result = await service.analyze({
    target,
    outputDirectory,
    analysedRef: args.ref ?? null,
    githubToken: credentials.githubToken,
    workspaceDirectory: process.cwd(),
    environment: process.env
  });

  console.log(`JSON output: ${result.outputs.json}`);
  console.log(`Markdown report: ${result.outputs.markdown}`);
  console.log(`Smells detected: ${result.summary.smellsDetected}`);
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length}`);
  }
}

/** Translates explicitly supplied CLI flags into highest-precedence configuration overrides. */
function buildCliConfiguration(args) {
  return {
    dirtyWaters: {
      enabled: flagOverride(args, "skip-dirty-waters", false),
      required: flagOverride(args, "require-dirty-waters", true),
      timeoutMs: positiveIntegerOption(args, "dirty-waters-timeout-ms")
    },
    npmRegistry: {
      timeoutMs: positiveIntegerOption(args, "peer-spin-registry-timeout-ms")
    },
    packageGovernance: {
      enabled: flagOverride(args, "skip-package-governance", false),
      required: flagOverride(args, "require-package-governance", true),
      concurrency: positiveIntegerOption(args, "package-governance-concurrency")
    },
    peerSpin: {
      enabled: flagOverride(args, "skip-peer-spin", false),
      required: flagOverride(args, "require-peer-spin", true),
      maxConflicts: positiveIntegerOption(args, "peer-spin-max-conflicts"),
      verificationConcurrency: positiveIntegerOption(args, "peer-spin-registry-concurrency")
    },
    sourceUsage: {
      enabled: flagOverride(args, "skip-source-usage", false),
      required: flagOverride(args, "require-source-usage", true),
      timeoutMs: positiveIntegerOption(args, "source-usage-timeout-ms")
    },
    responsiveness: {
      required: flagOverride(args, "require-responsiveness", true),
      concurrency: positiveIntegerOption(args, "responsiveness-concurrency")
    }
  };
}

/** Returns a boolean override only when its corresponding CLI flag was supplied. */
function flagOverride(args, flag, value) {
  return Object.hasOwn(args, flag) ? value : undefined;
}

/** Parses a positive integer CLI option and rejects invalid explicit values. */
function positiveIntegerOption(args, option) {
  if (!Object.hasOwn(args, option)) {
    return undefined;
  }

  const value = parsePositiveInteger(args[option], undefined);
  if (value === undefined) {
    throw new Error(`--${option} must be a positive integer.`);
  }
  return value;
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
  const defaults = resolveConfiguration();
  console.log(`Usage:
  node src/cli.js analyze --target <owner/repo> [options]

Options:
  --output <dir>              Output directory. Defaults to reports.
  --config <file>             Optional JSON configuration file.
  --ref <git-ref>             Analysed ref passed to Dirty-Waters.
  --dirty-waters-timeout-ms <ms>
                              Dirty-Waters execution timeout. Defaults to ${defaults.dirtyWaters.timeoutMs}.
  --skip-dirty-waters         Run the pipeline without the external adapter.
  --require-dirty-waters      Fail the analysis if Dirty-Waters fails.
  --package-governance-concurrency <count>
                              Concurrent npm metadata analyses. Defaults to ${defaults.packageGovernance.concurrency}.
  --skip-package-governance   Skip npm package governance metadata detection.
  --require-package-governance
                              Fail the analysis if package metadata cannot be retrieved.
  --responsiveness-concurrency <count>
                              Concurrent npm release-history lookups. Defaults to ${defaults.responsiveness.concurrency}.
  --require-responsiveness    Fail when npm responsiveness evidence cannot be retrieved.
  --peer-spin-registry-timeout-ms <ms>
                              Shared npm Registry request timeout. Defaults to ${defaults.npmRegistry.timeoutMs}.
  --peer-spin-max-conflicts <count>
                              Maximum PeerSpin candidates verified per analysis. Defaults to ${defaults.peerSpin.maxConflicts}.
  --peer-spin-registry-concurrency <count>
                              Concurrent registry verifications. Defaults to ${defaults.peerSpin.verificationConcurrency}.
  --skip-peer-spin            Skip PeerSpin dependency-resolution detection.
  --require-peer-spin         Fail the analysis if PeerSpin detection fails.
  --source-usage-timeout-ms <ms>
                              Knip source analysis timeout. Defaults to ${defaults.sourceUsage.timeoutMs}.
  --skip-source-usage         Skip unused and missing dependency detection.
  --require-source-usage      Fail the analysis if source-usage detection fails.

Environment:
  GITHUB_API_TOKEN            Required by Dirty-Waters for GitHub API access.
  DIRTY_WATERS_TIMEOUT_MS     Dirty-Waters timeout override in milliseconds.
  DIRTY_WATERS_AUTO_INSTALL   Set to false to disable automatic installation.
  NPM_REGISTRY_URL            Registry used for package metadata and PeerSpin verification.
  NPM_REGISTRY_TOKEN          Optional bearer token for private registry packages.
  NPM_REGISTRY_TIMEOUT_MS     Shared npm Registry timeout. Defaults to ${defaults.npmRegistry.timeoutMs}.
  NPM_REGISTRY_MAX_ATTEMPTS   Attempts for transient registry failures. Defaults to ${defaults.npmRegistry.maxAttempts}.
  NPM_REGISTRY_RETRY_DELAY_MS Base retry delay in milliseconds. Defaults to ${defaults.npmRegistry.retryDelayMs}.
  NPM_AUDIT_TIMEOUT_MS        npm audit timeout in milliseconds. Defaults to ${defaults.npmAudit.timeoutMs}.
  NPM_AUDIT_MAX_ATTEMPTS      Attempts for transient audit endpoint failures. Defaults to ${defaults.npmAudit.maxAttempts}.
  NPM_AUDIT_RETRY_DELAY_MS    Base audit retry delay in milliseconds. Defaults to ${defaults.npmAudit.retryDelayMs}.
  PACKAGE_GOVERNANCE_CONCURRENCY
                              Concurrent package governance analyses. Defaults to ${defaults.packageGovernance.concurrency}.
  RESPONSIVENESS_CONCURRENCY  Concurrent npm release-history lookups. Defaults to ${defaults.responsiveness.concurrency}.
  DOMAIN_LOOKUP_TIMEOUT_MS    Timeout for each DNS and RDAP lookup. Defaults to ${defaults.domainLookup.dnsTimeoutMs}/${defaults.domainLookup.rdapTimeoutMs}.
  RDAP_BOOTSTRAP_URL          RDAP service-discovery document URL.
  PEER_SPIN_REGISTRY_TIMEOUT_MS
                              Legacy shared npm Registry timeout override. Defaults to ${defaults.npmRegistry.timeoutMs}.
  PEER_SPIN_MAX_CONFLICTS     Maximum conflicts verified per analysis. Defaults to ${defaults.peerSpin.maxConflicts}.
  PEER_SPIN_REGISTRY_CONCURRENCY
                              Concurrent registry verifications. Defaults to ${defaults.peerSpin.verificationConcurrency}.
  PEER_SPIN_MAX_TRAVERSAL_NODES
                              Maximum dependency nodes traversed per candidate. Defaults to ${defaults.peerSpin.maxTraversalNodes}.
  SOURCE_USAGE_TIMEOUT_MS     Knip source analysis timeout override in milliseconds.
  SOURCE_USAGE_DOWNLOAD_TIMEOUT_MS
                              GitHub source archive download timeout. Defaults to ${defaults.sourceUsage.downloadTimeoutMs}.
  SOURCE_USAGE_MAX_ARCHIVE_BYTES
                              Maximum compressed repository archive size.
  SOURCE_USAGE_MAX_EXTRACTED_BYTES
                              Maximum extracted repository size.

Configuration precedence:
  config/default.json < --config file < environment < CLI options
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
