import { resolveNs } from "node:dns/promises";

const DEFAULT_TIMEOUT_MS = 10 * 1000;

/** Resolves whether a registrable domain has an authoritative DNS delegation. */
export class DnsDomainStatusProvider {
  /** Configures an injectable DNS resolver and bounded lookup duration. */
  constructor({
    resolveNameservers = resolveNs,
    timeoutMs = readPositiveInteger(
      process.env.DOMAIN_LOOKUP_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    )
  } = {}) {
    this.resolveNameservers = resolveNameservers;
    this.timeoutMs = timeoutMs;
  }

  /** Classifies a domain as registered, unregistered, or unavailable. */
  async check(domain) {
    try {
      const nameservers = await withTimeout(
        this.resolveNameservers(domain),
        this.timeoutMs,
        `DNS lookup timed out for ${domain}.`
      );
      return {
        status: nameservers.length > 0 ? "registered" : "unavailable",
        reason: nameservers.length > 0 ? null : "DNS returned no authoritative nameservers."
      };
    } catch (error) {
      if (["ENOTFOUND", "ENODOMAIN", "NOTFOUND"].includes(error.code)) {
        return { status: "unregistered", reason: error.message };
      }

      return { status: "unavailable", reason: error.message };
    }
  }
}

/** Rejects a pending DNS lookup after a bounded duration. */
async function withTimeout(promise, timeoutMs, message) {
  let timeoutHandle;
  const timeout = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/** Reads a positive integer timeout while retaining a stable fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
