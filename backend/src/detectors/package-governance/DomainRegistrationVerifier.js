import { DnsDomainStatusProvider } from "./DnsDomainStatusProvider.js";
import { RdapDomainStatusProvider } from "./RdapDomainStatusProvider.js";

/** Confirms unregistered maintainer domains using independent DNS and RDAP evidence. */
export class DomainRegistrationVerifier {
  /** Configures independently replaceable domain evidence providers and a shared cache. */
  constructor({
    dnsProvider = new DnsDomainStatusProvider(),
    rdapProvider = new RdapDomainStatusProvider()
  } = {}) {
    this.dnsProvider = dnsProvider;
    this.rdapProvider = rdapProvider;
    this.verificationPromises = new Map();
  }

  /** Returns a cached conservative registration classification for one domain. */
  async verify(domain) {
    if (!this.verificationPromises.has(domain)) {
      this.verificationPromises.set(domain, this.#verifyUncached(domain));
    }
    return this.verificationPromises.get(domain);
  }

  /** Requires both providers to report absence before confirming an expired domain smell. */
  async #verifyUncached(domain) {
    const checkedAt = new Date().toISOString();
    const dns = await this.dnsProvider.check(domain);
    if (dns.status === "registered") {
      return buildResult("registered", checkedAt, dns, null);
    }

    const rdap = await this.rdapProvider.check(domain);
    if (rdap.status === "registered") {
      return buildResult("registered", checkedAt, dns, rdap);
    }
    if (dns.status === "unregistered" && rdap.status === "unregistered") {
      return buildResult("unregistered", checkedAt, dns, rdap);
    }

    return buildResult("unavailable", checkedAt, dns, rdap);
  }
}

/** Builds stable domain evidence consumed by rules and JSON exporters. */
function buildResult(status, checkedAt, dns, rdap) {
  return {
    status,
    checkedAt,
    dnsStatus: dns.status,
    dnsReason: dns.reason,
    rdapStatus: rdap?.status ?? "not-queried",
    rdapReason: rdap?.reason ?? null
  };
}
