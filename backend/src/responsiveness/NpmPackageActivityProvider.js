const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Derives release recency and frequency from complete npm package documents. */
export class NpmPackageActivityProvider {
  /** Configures the shared npm Registry transport used to retrieve package history. */
  constructor({ registryClient } = {}) {
    if (!registryClient?.getPackageDocument) {
      throw new Error("NpmPackageActivityProvider requires an npm registry client.");
    }

    this.registryClient = registryClient;
  }

  /** Returns normalized activity evidence for one installed package version. */
  async getActivity(packageName, packageVersion, analysedAt = new Date()) {
    const document = await this.registryClient.getPackageDocument(packageName);
    const releaseDates = collectReleaseDates(document);
    const latestVersion = document["dist-tags"]?.latest ?? null;
    const latestReleaseAt = resolveLatestReleaseDate(document, releaseDates, latestVersion);

    if (!latestReleaseAt) {
      throw new Error(`npm metadata did not provide release timestamps for ${packageName}.`);
    }

    const analysedTimestamp = normalizeDate(analysedAt)?.getTime() ?? Date.now();
    const latestTimestamp = latestReleaseAt.getTime();
    const oneYearAgo = analysedTimestamp - (365 * MILLISECONDS_PER_DAY);
    const releasesLastYear = releaseDates.filter((date) => {
      const timestamp = date.getTime();
      return timestamp >= oneYearAgo && timestamp <= analysedTimestamp;
    }).length;
    const installedManifest = document.versions?.[packageVersion] ?? null;

    return {
      status: "complete",
      latestVersion,
      latestReleaseAt: latestReleaseAt.toISOString(),
      daysSinceLatestRelease: Math.max(
        0,
        Math.floor((analysedTimestamp - latestTimestamp) / MILLISECONDS_PER_DAY)
      ),
      releasesLastYear,
      installedVersionDeprecated: hasDeprecationMessage(installedManifest?.deprecated),
      metadataSource: "npm Registry"
    };
  }
}

/** Collects valid publication dates for versions present in the npm document. */
function collectReleaseDates(document) {
  const releaseDates = [];

  for (const version of Object.keys(document.versions ?? {})) {
    const releaseDate = normalizeDate(document.time?.[version]);
    if (releaseDate) {
      releaseDates.push(releaseDate);
    }
  }

  return releaseDates;
}

/** Resolves the latest-tag publication date before falling back to the newest release. */
function resolveLatestReleaseDate(document, releaseDates, latestVersion) {
  const taggedReleaseDate = normalizeDate(document.time?.[latestVersion]);
  if (taggedReleaseDate) {
    return taggedReleaseDate;
  }

  return releaseDates.reduce(
    (latest, candidate) => !latest || candidate > latest ? candidate : latest,
    null
  );
}

/** Parses valid timestamps without propagating malformed registry metadata. */
function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

/** Treats only non-empty npm deprecation messages as conclusive deprecation evidence. */
function hasDeprecationMessage(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}
