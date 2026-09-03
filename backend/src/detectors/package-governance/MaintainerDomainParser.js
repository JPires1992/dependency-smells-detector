import { getDomain } from "tldts";

/** Extracts normalized registrable domains from npm maintainer email addresses. */
export class MaintainerDomainParser {
  /** Returns a public-suffix-aware domain or null for an absent or malformed email. */
  parse(email) {
    if (typeof email !== "string") {
      return null;
    }

    const separatorIndex = email.trim().lastIndexOf("@");
    if (separatorIndex <= 0 || separatorIndex === email.trim().length - 1) {
      return null;
    }

    const hostname = email.trim().slice(separatorIndex + 1).toLowerCase();
    return getDomain(hostname, { allowPrivateDomains: true })?.toLowerCase() ?? null;
  }
}
