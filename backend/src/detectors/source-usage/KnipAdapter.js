import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { runCommand } from "../../utils/ChildProcess.js";

/** Default maximum duration for source-usage analysis. */
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

/** Absolute CLI path for the Knip version installed with the backend. */
const DEFAULT_KNIP_CLI_PATH = fileURLToPath(
  new URL("../../../node_modules/knip/bin/knip.js", import.meta.url)
);

/** Analyzer-owned configuration that avoids executing dependency-bound Vite config files. */
const DEFAULT_KNIP_CONFIGURATION = Object.freeze({
  vite: {
    config: [],
    entry: ["vite.config.{js,mjs,ts,cjs,mts,cts}"]
  }
});

/** Executes Knip in dependency-only mode and returns its structured JSON report. */
export class KnipAdapter {
  /** Configures process execution, CLI location, and analysis timeout. */
  constructor({
    commandRunner = runCommand,
    knipCliPath = DEFAULT_KNIP_CLI_PATH,
    configuration = DEFAULT_KNIP_CONFIGURATION,
    timeoutMs = readTimeoutFromEnvironment(),
    temporaryRootDirectory = os.tmpdir()
  } = {}) {
    this.name = "KnipAdapter";
    this.commandRunner = commandRunner;
    this.knipCliPath = knipCliPath;
    this.configuration = configuration;
    this.timeoutMs = timeoutMs;
    this.temporaryRootDirectory = temporaryRootDirectory;
  }

  /** Runs static dependency analysis without installing or executing target project scripts. */
  async analyze({ projectDirectory, env = process.env } = {}) {
    if (!projectDirectory) {
      throw new Error("Knip requires a materialized project directory.");
    }

    const configPath = path.join(
      this.temporaryRootDirectory,
      `.dependency-smells-knip-${randomUUID()}.json`
    );
    await writeFile(configPath, `${JSON.stringify(this.configuration, null, 2)}\n`, "utf8");

    try {
      const result = await this.commandRunner(
        process.execPath,
        [
          this.knipCliPath,
          "--config",
          configPath,
          "--directory",
          projectDirectory,
          "--workspace",
          ".",
          "--include",
          "dependencies,unlisted",
          "--reporter",
          "json",
          "--no-progress",
          "--no-config-hints",
          "--no-exit-code"
        ],
        {
          cwd: projectDirectory,
          env: { ...env, NO_COLOR: "1" },
          timeoutMs: this.timeoutMs
        }
      );

      if (result.exitCode !== 0) {
        throw new Error(
          `Knip failed with exit code ${result.exitCode}: ${result.stderr || result.stdout}`
        );
      }

      assertNoFatalDiagnostics(result.stderr);

      return {
        report: parseKnipJsonReport(result.stdout),
        warnings: normalizeDiagnosticWarnings(result.stderr)
      };
    } finally {
      await rm(configPath, { force: true });
    }
  }
}

/** Rejects reports produced after Knip encountered an internal or configuration error. */
function assertNoFatalDiagnostics(stderr) {
  const errors = String(stderr ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("ERROR:"));

  if (errors.length > 0) {
    throw new Error(`Knip analysis was incomplete: ${errors.join(" ")}`);
  }
}

/** Parses and validates the machine-readable Knip reporter contract. */
export function parseKnipJsonReport(stdout) {
  let report;

  try {
    report = JSON.parse(String(stdout ?? "").trim());
  } catch (error) {
    throw new Error(`Knip returned invalid JSON: ${error.message}`);
  }

  if (!report || !Array.isArray(report.issues)) {
    throw new Error("Knip JSON report does not contain an issues array.");
  }

  return report;
}

/** Converts non-empty Knip stderr lines into detector warnings. */
function normalizeDiagnosticWarnings(stderr) {
  return String(stderr ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `Knip diagnostic: ${line}`);
}

/** Reads an optional source-usage timeout from the process environment. */
function readTimeoutFromEnvironment() {
  const value = Number(process.env.SOURCE_USAGE_TIMEOUT_MS);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}
