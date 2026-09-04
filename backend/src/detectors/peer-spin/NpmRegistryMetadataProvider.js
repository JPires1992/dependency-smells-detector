import { NpmRegistryClient } from "../../registry/npm/NpmRegistryClient.js";
import { parsePositiveInteger } from "../../utils/PositiveInteger.js";

/** Backwards-compatible PeerSpin provider backed by the shared npm registry client. */
export class NpmRegistryMetadataProvider extends NpmRegistryClient {
  /** Preserves the PeerSpin-specific timeout environment variable used by the CLI. */
  constructor(options = {}) {
    super({
      ...options,
      timeoutMs: options.timeoutMs
        ?? parsePositiveInteger(process.env.PEER_SPIN_REGISTRY_TIMEOUT_MS, undefined)
    });
  }
}
