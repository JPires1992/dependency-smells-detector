/** Default npm registry endpoint used for package metadata requests. */
const DEFAULT_REGISTRY_URL = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 30 * 1000;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 250;
const MAX_RETRY_DELAY_MS = 30 * 1000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Fetches and caches npm manifests without coupling consumers to HTTP details. */
export class NpmRegistryClient {
  /** Configures registry transport, authentication, timeout, and request caches. */
  constructor({
    fetchImpl = globalThis.fetch,
    registryUrl = process.env.NPM_REGISTRY_URL || DEFAULT_REGISTRY_URL,
    token = process.env.NPM_REGISTRY_TOKEN || process.env.NODE_AUTH_TOKEN || null,
    timeoutMs = parsePositiveInteger(
      process.env.NPM_REGISTRY_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    ),
    maxAttempts = parsePositiveInteger(
      process.env.NPM_REGISTRY_MAX_ATTEMPTS,
      DEFAULT_MAX_ATTEMPTS
    ),
    retryDelayMs = parsePositiveInteger(
      process.env.NPM_REGISTRY_RETRY_DELAY_MS,
      DEFAULT_RETRY_DELAY_MS
    ),
    sleep = wait
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("NpmRegistryClient requires a fetch implementation.");
    }

    this.fetchImpl = fetchImpl;
    this.registryUrl = registryUrl.replace(/\/+$/, "");
    this.token = token;
    this.timeoutMs = timeoutMs;
    this.maxAttempts = maxAttempts;
    this.retryDelayMs = retryDelayMs;
    this.sleep = sleep;
    this.manifestPromises = new Map();
  }

  /** Returns metadata for the package version currently assigned to the latest tag. */
  async getLatestManifest(packageName) {
    validatePackageName(packageName);
    return this.#getCachedManifest(`latest:${packageName}`, packageName, "latest", null);
  }

  /** Returns the immutable manifest published for one exact package version. */
  async getVersionManifest(packageName, version) {
    validatePackageName(packageName);
    if (!version) {
      throw new Error("An exact package version is required for registry verification.");
    }

    return this.#getCachedManifest(
      `version:${packageName}@${version}`,
      packageName,
      String(version),
      String(version)
    );
  }

  /** Returns the complete package document including release timestamps and versions. */
  async getPackageDocument(packageName) {
    validatePackageName(packageName);
    return this.#getCachedPackageDocument(packageName);
  }

  /** Reuses in-flight and completed manifest requests within one analysis process. */
  #getCachedManifest(cacheKey, packageName, versionSelector, expectedVersion) {
    if (!this.manifestPromises.has(cacheKey)) {
      this.#cacheRequest(
        cacheKey,
        this.#fetchManifest(packageName, versionSelector, expectedVersion)
      );
    }

    return this.manifestPromises.get(cacheKey);
  }

  /** Reuses complete package documents across package versions and responsiveness findings. */
  #getCachedPackageDocument(packageName) {
    const cacheKey = `document:${packageName}`;
    if (!this.manifestPromises.has(cacheKey)) {
      this.#cacheRequest(cacheKey, this.#fetchPackageDocument(packageName));
    }

    return this.manifestPromises.get(cacheKey);
  }

  /** Caches one request and evicts rejected promises so later consumers can retry. */
  #cacheRequest(cacheKey, request) {
    this.manifestPromises.set(cacheKey, request);
    request.catch(() => {
      if (this.manifestPromises.get(cacheKey) === request) {
        this.manifestPromises.delete(cacheKey);
      }
    });
  }

  /** Performs one authenticated request against an npm package-version endpoint. */
  async #fetchManifest(packageName, versionSelector, expectedVersion) {
    const packagePath = encodeURIComponent(packageName);
    const selectorPath = encodeURIComponent(versionSelector);
    const manifest = await this.#fetchJsonWithRetry(
      `${this.registryUrl}/${packagePath}/${selectorPath}`,
      `${packageName}@${versionSelector}`
    );
    if (!manifest || manifest.name !== packageName) {
      throw new Error(`npm registry returned mismatched metadata for ${packageName}.`);
    }
    if (expectedVersion && String(manifest.version) !== expectedVersion) {
      throw new Error(`npm registry returned mismatched metadata for ${packageName}@${expectedVersion}.`);
    }

    return Object.freeze(manifest);
  }

  /** Fetches a full npm package document required for release-history analysis. */
  async #fetchPackageDocument(packageName) {
    const packagePath = encodeURIComponent(packageName);
    const document = await this.#fetchJsonWithRetry(
      `${this.registryUrl}/${packagePath}`,
      packageName
    );
    if (!document || document.name !== packageName) {
      throw new Error(`npm registry returned a mismatched package document for ${packageName}.`);
    }

    return Object.freeze(document);
  }

  /** Retries idempotent registry reads after bounded transport and transient HTTP failures. */
  async #fetchJsonWithRetry(url, requestTarget) {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      let response;
      try {
        response = await this.fetchImpl(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "dependency-smells-detector",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
          },
          signal: AbortSignal.timeout(this.timeoutMs)
        });
      } catch (error) {
        if (attempt === this.maxAttempts) {
          throw error;
        }
        await this.sleep(retryDelayForAttempt(attempt, this.retryDelayMs));
        continue;
      }

      if (response.ok) {
        return response.json();
      }

      const error = new Error(
        `npm registry returned HTTP ${response.status} for ${requestTarget}.`
      );
      if (attempt === this.maxAttempts || !RETRYABLE_STATUS_CODES.has(response.status)) {
        throw error;
      }

      await this.sleep(retryDelayFromResponse(response, attempt, this.retryDelayMs));
    }

    throw new Error(`npm registry request failed for ${requestTarget}.`);
  }
}

/** Resolves Retry-After or exponential backoff while capping external delay input. */
function retryDelayFromResponse(response, attempt, baseDelayMs) {
  const retryAfter = response.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
    }
  }

  return retryDelayForAttempt(attempt, baseDelayMs);
}

/** Calculates capped exponential backoff for a one-based failed attempt. */
function retryDelayForAttempt(attempt, baseDelayMs) {
  return Math.min(baseDelayMs * (2 ** (attempt - 1)), MAX_RETRY_DELAY_MS);
}

/** Waits for a retry delay without blocking the Node.js event loop. */
function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/** Rejects empty package identifiers before constructing a registry request. */
function validatePackageName(packageName) {
  if (!packageName || typeof packageName !== "string") {
    throw new Error("A package name is required for registry metadata lookup.");
  }
}

import { parsePositiveInteger } from "../../utils/PositiveInteger.js";
