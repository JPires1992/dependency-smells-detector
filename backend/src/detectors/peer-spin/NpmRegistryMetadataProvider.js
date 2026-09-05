import { NpmRegistryClient } from "../../registry/npm/NpmRegistryClient.js";

/** Backwards-compatible PeerSpin provider backed by the shared npm registry client. */
export class NpmRegistryMetadataProvider extends NpmRegistryClient {}
