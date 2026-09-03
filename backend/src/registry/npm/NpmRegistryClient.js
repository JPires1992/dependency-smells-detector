/** Default npm registry endpoint used for package metadata requests. */
const DEFAULT_REGISTRY_URL = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 30 * 1000;

/** Fetches and caches npm manifests without coupling consumers to HTTP details. */
export class NpmRegistryClient {
  /** Configures registry transport, authentication, timeout, and request caches. */
  constructor({
    fetchImpl = globalThis.fetch,
    registryUrl = process.env.NPM_REGISTRY_URL || DEFAULT_REGISTRY_URL,
    token = process.env.NPM_REGISTRY_TOKEN || process.env.NODE_AUTH_TOKEN || null,
    timeoutMs = readPositiveInteger(
      process.env.NPM_REGISTRY_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    )
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("NpmRegistryClient requires a fetch implementation.");
    }

    this.fetchImpl = fetchImpl;
    this.registryUrl = registryUrl.replace(/\/+$/, "");
    this.token = token;
    this.timeoutMs = timeoutMs;
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
      this.manifestPromises.set(
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
      this.manifestPromises.set(cacheKey, this.#fetchPackageDocument(packageName));
    }

    return this.manifestPromises.get(cacheKey);
  }

  /** Performs one authenticated request against an npm package-version endpoint. */
  async #fetchManifest(packageName, versionSelector, expectedVersion) {
    const packagePath = encodeURIComponent(packageName);
    const selectorPath = encodeURIComponent(versionSelector);
    const response = await this.fetchImpl(
      `${this.registryUrl}/${packagePath}/${selectorPath}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "dependency-smells-detector",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      }
    );

    if (!response.ok) {
      throw new Error(
        `npm registry returned HTTP ${response.status} for ${packageName}@${versionSelector}.`
      );
    }

    const manifest = await response.json();
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
    const response = await this.fetchImpl(`${this.registryUrl}/${packagePath}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "dependency-smells-detector",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      },
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`npm registry returned HTTP ${response.status} for ${packageName}.`);
    }

    const document = await response.json();
    if (!document || document.name !== packageName) {
      throw new Error(`npm registry returned a mismatched package document for ${packageName}.`);
    }

    return Object.freeze(document);
  }
}

/** Rejects empty package identifiers before constructing a registry request. */
function validatePackageName(packageName) {
  if (!packageName || typeof packageName !== "string") {
    throw new Error("A package name is required for registry metadata lookup.");
  }
}

/** Reads a positive integer setting while preserving a deterministic fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
