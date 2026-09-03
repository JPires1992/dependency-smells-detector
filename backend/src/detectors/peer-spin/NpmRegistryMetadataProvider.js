import { NpmRegistryClient } from "../../registry/npm/NpmRegistryClient.js";

/** Backwards-compatible PeerSpin provider backed by the shared npm registry client. */
export class NpmRegistryMetadataProvider extends NpmRegistryClient {
  /** Preserves the PeerSpin-specific timeout environment variable used by the CLI. */
  constructor(options = {}) {
    super({
      ...options,
      timeoutMs: options.timeoutMs
        ?? readPositiveInteger(process.env.PEER_SPIN_REGISTRY_TIMEOUT_MS, undefined)
    });
  }
}

/** Reads a positive integer setting without overriding the shared client fallback. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
