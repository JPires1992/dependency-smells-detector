/** Authoritative IANA bootstrap document for domain RDAP service discovery. */
const DEFAULT_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const DEFAULT_TIMEOUT_MS = 15 * 1000;

/** Queries authoritative RDAP services discovered from the IANA DNS bootstrap. */
export class RdapDomainStatusProvider {
  /** Configures HTTP transport, service discovery, and bounded request duration. */
  constructor({
    fetchImpl = globalThis.fetch,
    bootstrapUrl = DEFAULT_BOOTSTRAP_URL,
    timeoutMs = readPositiveInteger(
      process.env.DOMAIN_LOOKUP_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    )
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("RdapDomainStatusProvider requires a fetch implementation.");
    }

    this.fetchImpl = fetchImpl;
    this.bootstrapUrl = bootstrapUrl;
    this.timeoutMs = timeoutMs;
    this.serviceMapPromise = null;
  }

  /** Classifies a domain from the response of its authoritative RDAP service. */
  async check(domain) {
    try {
      const serviceUrl = await this.#resolveServiceUrl(domain);
      if (!serviceUrl) {
        return {
          status: "unavailable",
          reason: `No authoritative RDAP service was found for ${domain}.`
        };
      }

      const response = await this.fetchImpl(
        new URL(`domain/${encodeURIComponent(domain)}`, ensureTrailingSlash(serviceUrl)),
        {
          headers: {
            Accept: "application/rdap+json",
            "User-Agent": "dependency-smells-detector"
          },
          signal: AbortSignal.timeout(this.timeoutMs)
        }
      );

      if (response.status === 404) {
        return { status: "unregistered", reason: "The authoritative RDAP service returned 404." };
      }
      if (!response.ok) {
        return {
          status: "unavailable",
          reason: `The authoritative RDAP service returned HTTP ${response.status}.`
        };
      }

      return { status: "registered", reason: null };
    } catch (error) {
      return { status: "unavailable", reason: error.message };
    }
  }

  /** Selects the RDAP service mapped to the longest matching domain suffix. */
  async #resolveServiceUrl(domain) {
    const serviceMap = await this.#getServiceMap();
    const labels = domain.toLowerCase().split(".");

    for (let index = 0; index < labels.length; index += 1) {
      const suffix = labels.slice(index).join(".");
      if (serviceMap.has(suffix)) {
        return serviceMap.get(suffix);
      }
    }

    return null;
  }

  /** Loads and caches the IANA mapping from top-level domains to RDAP services. */
  async #getServiceMap() {
    if (!this.serviceMapPromise) {
      this.serviceMapPromise = this.#fetchServiceMap();
    }
    return this.serviceMapPromise;
  }

  /** Converts the IANA bootstrap response into a suffix-indexed service map. */
  async #fetchServiceMap() {
    const response = await this.fetchImpl(this.bootstrapUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "dependency-smells-detector"
      },
      signal: AbortSignal.timeout(this.timeoutMs)
    });
    if (!response.ok) {
      throw new Error(`IANA RDAP bootstrap returned HTTP ${response.status}.`);
    }

    const document = await response.json();
    if (!Array.isArray(document?.services)) {
      throw new Error("IANA RDAP bootstrap did not contain a services array.");
    }

    const serviceMap = new Map();
    for (const [suffixes, serviceUrls] of document.services) {
      const serviceUrl = serviceUrls?.find((url) => url.startsWith("https://"))
        ?? serviceUrls?.[0];
      if (!serviceUrl) {
        continue;
      }
      for (const suffix of suffixes ?? []) {
        serviceMap.set(String(suffix).toLowerCase(), serviceUrl);
      }
    }
    return serviceMap;
  }
}

/** Ensures relative RDAP resource paths are appended after the service base path. */
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

/** Reads a positive integer timeout while retaining a stable fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
