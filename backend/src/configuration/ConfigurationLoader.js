import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEFAULT_CONFIGURATION_PATH = fileURLToPath(
  new URL("../../config/default.json", import.meta.url)
);

/** Immutable application defaults loaded once from the canonical configuration document. */
const DEFAULT_CONFIGURATION = deepFreeze(
  parseJsonObject(
    readFileSync(DEFAULT_CONFIGURATION_PATH, "utf8"),
    "default configuration"
  )
);

/** Maps supported environment variables to their canonical configuration paths. */
const ENVIRONMENT_BINDINGS = Object.freeze([
  ["DIRTY_WATERS_TIMEOUT_MS", "dirtyWaters.timeoutMs", "positiveInteger"],
  ["DIRTY_WATERS_EXECUTABLE", "dirtyWaters.executable", "string"],
  ["DIRTY_WATERS_PIP_COMMAND", "dirtyWaters.pipCommand", "string"],
  ["DIRTY_WATERS_INSTALL_SOURCE", "dirtyWaters.installSource", "string"],
  ["DIRTY_WATERS_AUTO_INSTALL", "dirtyWaters.autoInstall", "boolean"],
  ["NPM_REGISTRY_URL", "npmRegistry.registryUrl", "string"],
  ["NPM_REGISTRY_TIMEOUT_MS", "npmRegistry.timeoutMs", "positiveInteger"],
  ["NPM_REGISTRY_MAX_ATTEMPTS", "npmRegistry.maxAttempts", "positiveInteger"],
  ["NPM_REGISTRY_RETRY_DELAY_MS", "npmRegistry.retryDelayMs", "positiveInteger"],
  ["NPM_AUDIT_TIMEOUT_MS", "npmAudit.timeoutMs", "positiveInteger"],
  ["NPM_AUDIT_MAX_ATTEMPTS", "npmAudit.maxAttempts", "positiveInteger"],
  ["NPM_AUDIT_RETRY_DELAY_MS", "npmAudit.retryDelayMs", "positiveInteger"],
  ["PACKAGE_GOVERNANCE_CONCURRENCY", "packageGovernance.concurrency", "positiveInteger"],
  ["RDAP_BOOTSTRAP_URL", "domainLookup.rdapBootstrapUrl", "string"],
  ["RESPONSIVENESS_CONCURRENCY", "responsiveness.concurrency", "positiveInteger"],
  ["PEER_SPIN_MAX_CONFLICTS", "peerSpin.maxConflicts", "positiveInteger"],
  ["PEER_SPIN_REGISTRY_CONCURRENCY", "peerSpin.verificationConcurrency", "positiveInteger"],
  ["PEER_SPIN_MAX_TRAVERSAL_NODES", "peerSpin.maxTraversalNodes", "positiveInteger"],
  ["SOURCE_USAGE_TIMEOUT_MS", "sourceUsage.timeoutMs", "positiveInteger"],
  ["SOURCE_USAGE_DOWNLOAD_TIMEOUT_MS", "sourceUsage.downloadTimeoutMs", "positiveInteger"],
  ["SOURCE_USAGE_MAX_ARCHIVE_BYTES", "sourceUsage.maxArchiveBytes", "positiveInteger"],
  ["SOURCE_USAGE_MAX_EXTRACTED_BYTES", "sourceUsage.maxExtractedBytes", "positiveInteger"]
]);

/** Loads, validates, and merges application configuration in deterministic precedence order. */
export async function loadConfiguration({
  configPath = null,
  env = process.env,
  cliOverrides = {}
} = {}) {
  const fileOverrides = configPath
    ? await readJsonObject(configPath, `configuration file '${configPath}'`)
    : {};
  assertConfigurationShape(fileOverrides, DEFAULT_CONFIGURATION, "Configuration file");

  const environmentOverrides = configurationFromEnvironment(env);
  const normalizedCliOverrides = removeUndefinedValues(cliOverrides);
  assertConfigurationShape(normalizedCliOverrides, DEFAULT_CONFIGURATION, "CLI configuration");

  const configuration = resolveConfiguration(
    fileOverrides,
    environmentOverrides,
    normalizedCliOverrides
  );

  return {
    configuration,
    credentials: Object.freeze({
      githubToken: readOptionalString(env.GITHUB_API_TOKEN),
      npmRegistryToken: readOptionalString(env.NPM_REGISTRY_TOKEN)
        ?? readOptionalString(env.NODE_AUTH_TOKEN)
    })
  };
}

/** Resolves programmatic overrides against the same defaults used by file and CLI loading. */
export function resolveConfiguration(...overrides) {
  const normalizedOverrides = overrides.map(removeUndefinedValues);
  for (const override of normalizedOverrides) {
    assertConfigurationShape(override, DEFAULT_CONFIGURATION, "Configuration override");
  }

  const configuration = mergeObjects(DEFAULT_CONFIGURATION, ...normalizedOverrides);
  assertConfigurationShape(configuration, DEFAULT_CONFIGURATION, "Resolved configuration");
  return deepFreeze(configuration);
}

/** Reads and parses one JSON configuration document with contextual errors. */
async function readJsonObject(filePath, description) {
  let content;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Could not read ${description}: ${error.message}`);
  }

  return parseJsonObject(content, description);
}

/** Parses one JSON object while preserving the configuration source in diagnostics. */
function parseJsonObject(content, description) {
  try {
    const document = JSON.parse(content);
    if (!isPlainObject(document)) {
      throw new Error("the root value must be an object");
    }
    return document;
  } catch (error) {
    throw new Error(`Could not parse ${description}: ${error.message}`);
  }
}

/** Converts supported environment values into the nested application configuration model. */
function configurationFromEnvironment(env) {
  const overrides = {};

  for (const [variable, propertyPath, valueType] of ENVIRONMENT_BINDINGS) {
    const rawValue = env[variable];
    if (rawValue === undefined || rawValue === "") {
      continue;
    }
    setNestedValue(overrides, propertyPath, parseEnvironmentValue(variable, rawValue, valueType));
  }

  const domainTimeout = readEnvironmentPositiveInteger(env, "DOMAIN_LOOKUP_TIMEOUT_MS");
  if (domainTimeout !== undefined) {
    setNestedValue(overrides, "domainLookup.dnsTimeoutMs", domainTimeout);
    setNestedValue(overrides, "domainLookup.rdapTimeoutMs", domainTimeout);
  }

  if (env.NPM_REGISTRY_TIMEOUT_MS === undefined || env.NPM_REGISTRY_TIMEOUT_MS === "") {
    const legacyTimeout = readEnvironmentPositiveInteger(env, "PEER_SPIN_REGISTRY_TIMEOUT_MS");
    if (legacyTimeout !== undefined) {
      setNestedValue(overrides, "npmRegistry.timeoutMs", legacyTimeout);
    }
  }

  return overrides;
}

/** Parses an environment value according to its declared configuration type. */
function parseEnvironmentValue(variable, value, valueType) {
  if (valueType === "positiveInteger") {
    return parsePositiveInteger(value, `Environment variable ${variable}`);
  }
  if (valueType === "boolean") {
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "true" || normalized === "false") {
      return normalized === "true";
    }
    throw new Error(`Environment variable ${variable} must be true or false.`);
  }

  const normalized = readOptionalString(value);
  if (!normalized) {
    throw new Error(`Environment variable ${variable} must be a non-empty string.`);
  }
  return normalized;
}

/** Reads an optional positive integer environment override. */
function readEnvironmentPositiveInteger(env, variable) {
  const value = env[variable];
  return value === undefined || value === ""
    ? undefined
    : parsePositiveInteger(value, `Environment variable ${variable}`);
}

/** Converts a value to a positive integer or reports its configuration source. */
function parsePositiveInteger(value, description) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${description} must be a positive integer.`);
  }
  return parsed;
}

/** Validates keys and primitive types against the complete default configuration shape. */
function assertConfigurationShape(candidate, schema, description, propertyPath = "") {
  if (!isPlainObject(candidate)) {
    throw new Error(`${description} must be an object.`);
  }

  for (const [key, value] of Object.entries(candidate)) {
    const currentPath = propertyPath ? `${propertyPath}.${key}` : key;
    if (!Object.hasOwn(schema, key)) {
      throw new Error(`${description} contains unknown property '${currentPath}'.`);
    }

    const expected = schema[key];
    if (isPlainObject(expected)) {
      assertConfigurationShape(value, expected, description, currentPath);
      continue;
    }
    if (typeof value !== typeof expected) {
      throw new Error(`${description} property '${currentPath}' must be ${typeof expected}.`);
    }
    if (typeof expected === "number" && (!Number.isInteger(value) || value <= 0)) {
      throw new Error(`${description} property '${currentPath}' must be a positive integer.`);
    }
    if (typeof expected === "string" && value.trim() === "") {
      throw new Error(`${description} property '${currentPath}' must be a non-empty string.`);
    }
  }
}

/** Deeply merges plain objects while replacing primitive leaf values by precedence. */
function mergeObjects(...sources) {
  const result = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source ?? {})) {
      result[key] = isPlainObject(value)
        ? mergeObjects(isPlainObject(result[key]) ? result[key] : {}, value)
        : value;
    }
  }
  return result;
}

/** Removes undefined leaves so omitted CLI arguments cannot override lower-precedence values. */
function removeUndefinedValues(value) {
  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, isPlainObject(entry) ? removeUndefinedValues(entry) : entry])
      .filter(([, entry]) => !isPlainObject(entry) || Object.keys(entry).length > 0)
  );
}

/** Assigns a value to a dot-separated path in an environment override object. */
function setNestedValue(target, propertyPath, value) {
  const parts = propertyPath.split(".");
  const property = parts.pop();
  let current = target;
  for (const part of parts) {
    current[part] ??= {};
    current = current[part];
  }
  current[property] = value;
}

/** Returns trimmed non-empty secrets without persisting them in application configuration. */
function readOptionalString(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

/** Recursively freezes resolved configuration to prevent runtime mutation. */
function deepFreeze(value) {
  for (const entry of Object.values(value)) {
    if (isPlainObject(entry)) {
      deepFreeze(entry);
    }
  }
  return Object.freeze(value);
}

/** Identifies JSON-style objects accepted by the configuration merger. */
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
