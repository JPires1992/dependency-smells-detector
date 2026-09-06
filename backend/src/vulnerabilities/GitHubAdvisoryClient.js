import {
  requireNonEmptyString,
  requirePositiveInteger
} from "../utils/ConfigurationValue.js";

const MAX_RETRY_DELAY_MS = 30 * 1000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Fetches and caches structured GitHub Security Advisory metadata by GHSA identifier. */
export class GitHubAdvisoryClient {
  /** Configures GitHub transport, authentication, timeout, retries, and request caching. */
  constructor({
    fetchImpl = globalThis.fetch,
    apiUrl,
    apiVersion,
    token = null,
    timeoutMs,
    maxAttempts,
    retryDelayMs,
    sleep = wait
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new Error("GitHubAdvisoryClient requires a fetch implementation.");
    }

    this.fetchImpl = fetchImpl;
    this.apiUrl = requireNonEmptyString(apiUrl, "githubAdvisories.apiUrl").replace(/\/+$/, "");
    this.apiVersion = requireNonEmptyString(apiVersion, "githubAdvisories.apiVersion");
    this.token = token;
    this.timeoutMs = requirePositiveInteger(timeoutMs, "githubAdvisories.timeoutMs");
    this.maxAttempts = requirePositiveInteger(maxAttempts, "githubAdvisories.maxAttempts");
    this.retryDelayMs = requirePositiveInteger(retryDelayMs, "githubAdvisories.retryDelayMs");
    this.sleep = sleep;
    this.advisoryPromises = new Map();
  }

  /** Returns normalized publication metadata for one public GitHub advisory. */
  getAdvisory(ghsaId) {
    const normalizedId = normalizeGhsaId(ghsaId);
    if (!this.advisoryPromises.has(normalizedId)) {
      this.#cacheRequest(normalizedId, this.#fetchAdvisory(normalizedId));
    }

    return this.advisoryPromises.get(normalizedId);
  }

  /** Caches successful and in-flight requests while allowing failed lookups to be retried later. */
  #cacheRequest(ghsaId, request) {
    this.advisoryPromises.set(ghsaId, request);
    request.catch(() => {
      if (this.advisoryPromises.get(ghsaId) === request) {
        this.advisoryPromises.delete(ghsaId);
      }
    });
  }

  /** Reads one advisory with bounded retries for transport and transient HTTP failures. */
  async #fetchAdvisory(ghsaId) {
    const url = `${this.apiUrl}/${encodeURIComponent(ghsaId)}`;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      let response;
      try {
        response = await this.fetchImpl(url, {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "dependency-smells-detector",
            "X-GitHub-Api-Version": this.apiVersion,
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
          },
          signal: AbortSignal.timeout(this.timeoutMs)
        });
      } catch (error) {
        if (attempt === this.maxAttempts) {
          throw new Error(`GitHub advisory request failed for ${ghsaId}: ${error.message}`);
        }
        await this.sleep(retryDelayForAttempt(attempt, this.retryDelayMs));
        continue;
      }

      if (response.ok) {
        return normalizeAdvisoryResponse(await response.json(), ghsaId);
      }

      if (attempt === this.maxAttempts || !RETRYABLE_STATUS_CODES.has(response.status)) {
        throw new Error(`GitHub Advisory API returned HTTP ${response.status} for ${ghsaId}.`);
      }

      await this.sleep(retryDelayFromResponse(response, attempt, this.retryDelayMs));
    }

    throw new Error(`GitHub advisory request exhausted its configured attempts for ${ghsaId}.`);
  }
}

/** Validates and canonicalizes one GitHub Security Advisory identifier. */
function normalizeGhsaId(ghsaId) {
  const normalized = String(ghsaId ?? "").trim().toUpperCase();
  if (!/^GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
    throw new Error(`Invalid GitHub Security Advisory identifier '${ghsaId}'.`);
  }
  return normalized;
}

/** Retains only advisory fields required to calculate disclosed vulnerability persistence. */
function normalizeAdvisoryResponse(document, expectedGhsaId) {
  const ghsaId = normalizeGhsaId(document?.ghsa_id);
  if (ghsaId !== expectedGhsaId) {
    throw new Error(`GitHub Advisory API returned mismatched metadata for ${expectedGhsaId}.`);
  }

  return Object.freeze({
    ghsaId,
    publishedAt: document.published_at ?? null,
    withdrawnAt: document.withdrawn_at ?? null
  });
}

/** Resolves Retry-After or exponential backoff while capping externally supplied delays. */
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
