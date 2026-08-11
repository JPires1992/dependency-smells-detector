/** Default npm registry endpoint used for exact package-version manifests. */
const DEFAULT_REGISTRY_URL = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 30 * 1000;

/** Fetches and caches exact npm package manifests required to verify PeerSpin candidates. */
export class NpmRegistryMetadataProvider {
  /** Configures registry transport, authentication, timeout, and request cache. */
  constructor({
    fetchImpl = globalThis.fetch,
    registryUrl = process.env.NPM_REGISTRY_URL || DEFAULT_REGISTRY_URL,
    token = process.env.NPM_REGISTRY_TOKEN || process.env.NODE_AUTH_TOKEN || null,
    timeoutMs = readPositiveInteger(
      process.env.PEER_SPIN_REGISTRY_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    )
  } = {}) {
    this.fetchImpl = fetchImpl;
    this.registryUrl = registryUrl.replace(/\/+$/, "");
    this.token = token;
    this.timeoutMs = timeoutMs;
    this.manifestPromises = new Map();
  }

  /** Returns the immutable manifest published for one exact package version. */
  async getVersionManifest(packageName, version) {
    if (!packageName || !version) {
      throw new Error("An exact package name and version are required for registry verification.");
    }

    const cacheKey = `${packageName}@${version}`;
    if (!this.manifestPromises.has(cacheKey)) {
      this.manifestPromises.set(cacheKey, this.#fetchVersionManifest(packageName, version));
    }

    return this.manifestPromises.get(cacheKey);
  }

  /** Performs one authenticated npm registry request for an exact version endpoint. */
  async #fetchVersionManifest(packageName, version) {
    const packagePath = encodeURIComponent(packageName);
    const versionPath = encodeURIComponent(version);
    const response = await this.fetchImpl(
      `${this.registryUrl}/${packagePath}/${versionPath}`,
      {
        headers: {
          Accept: "application/vnd.npm.install-v1+json",
          "User-Agent": "dependency-smells-detector",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      }
    );

    if (!response.ok) {
      throw new Error(
        `npm registry returned HTTP ${response.status} for ${packageName}@${version}.`
      );
    }

    const manifest = await response.json();
    if (!manifest || manifest.name !== packageName || String(manifest.version) !== String(version)) {
      throw new Error(`npm registry returned mismatched metadata for ${packageName}@${version}.`);
    }

    return Object.freeze(manifest);
  }
}

/** Reads a positive integer setting while preserving a deterministic fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
