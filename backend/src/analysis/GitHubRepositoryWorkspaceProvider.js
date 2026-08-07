import { createWriteStream } from "node:fs";
import { access, mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import { x as extractTar } from "tar";

/** Default limits for downloading and extracting untrusted repository snapshots. */
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 2 * 60 * 1000;
const DEFAULT_MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const DEFAULT_MAX_EXTRACTED_BYTES = 500 * 1024 * 1024;

/** Owns one temporary repository snapshot and removes it after source analysis. */
export class RepositoryWorkspaceLease {
  /** Stores the analysis directory and its private temporary root. */
  constructor(directory, temporaryDirectory) {
    this.directory = directory;
    this.temporaryDirectory = temporaryDirectory;
  }

  /** Recursively removes all downloaded and extracted repository data. */
  async cleanup() {
    await rm(this.temporaryDirectory, { recursive: true, force: true });
  }
}

/** Downloads an exact GitHub repository ref into an isolated temporary workspace. */
export class GitHubRepositoryWorkspaceProvider {
  /** Configures transport, extraction, timeouts, and resource limits for repository snapshots. */
  constructor({
    fetchImpl = globalThis.fetch,
    archiveExtractor = extractRepositoryArchive,
    temporaryRootDirectory = os.tmpdir(),
    downloadTimeoutMs = readPositiveInteger(
      process.env.SOURCE_USAGE_DOWNLOAD_TIMEOUT_MS,
      DEFAULT_DOWNLOAD_TIMEOUT_MS
    ),
    maxArchiveBytes = readPositiveInteger(
      process.env.SOURCE_USAGE_MAX_ARCHIVE_BYTES,
      DEFAULT_MAX_ARCHIVE_BYTES
    ),
    maxExtractedBytes = readPositiveInteger(
      process.env.SOURCE_USAGE_MAX_EXTRACTED_BYTES,
      DEFAULT_MAX_EXTRACTED_BYTES
    )
  } = {}) {
    this.fetchImpl = fetchImpl;
    this.archiveExtractor = archiveExtractor;
    this.temporaryRootDirectory = temporaryRootDirectory;
    this.downloadTimeoutMs = downloadTimeoutMs;
    this.maxArchiveBytes = maxArchiveBytes;
    this.maxExtractedBytes = maxExtractedBytes;
  }

  /** Materializes a repository ref and returns a lease that the caller must clean up. */
  async materialize({ repository, ref = null, token = null } = {}) {
    if (!repository) {
      throw new Error("A GitHub repository is required for source-usage analysis.");
    }

    const temporaryDirectory = await mkdtemp(
      path.join(this.temporaryRootDirectory, "dependency-smells-source-")
    );
    const archivePath = path.join(temporaryDirectory, "repository.tar.gz");
    const sourceDirectory = path.join(temporaryDirectory, "repository");

    try {
      await mkdir(sourceDirectory, { recursive: true });
      const response = await this.fetchImpl(buildArchiveUrl(repository, ref), {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "dependency-smells-detector",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        redirect: "follow",
        signal: AbortSignal.timeout(this.downloadTimeoutMs)
      });

      if (!response.ok) {
        throw new Error(`GitHub repository archive request returned HTTP ${response.status}.`);
      }

      await downloadResponseBody(response, archivePath, this.maxArchiveBytes);
      await this.archiveExtractor({
        archivePath,
        destinationDirectory: sourceDirectory,
        maxExtractedBytes: this.maxExtractedBytes
      });
      await access(path.join(sourceDirectory, "package.json"));

      return new RepositoryWorkspaceLease(sourceDirectory, temporaryDirectory);
    } catch (error) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      throw new Error(`Could not materialize GitHub repository source: ${error.message}`);
    }
  }
}

/** Builds the authenticated GitHub tarball endpoint for one repository and ref. */
function buildArchiveUrl(repository, ref) {
  const repositoryParts = String(repository).split("/");
  if (repositoryParts.length !== 2 || repositoryParts.some((part) => !part)) {
    throw new Error("GitHub repository must use owner/repo format.");
  }

  const [owner, name] = repositoryParts.map(encodeURIComponent);
  const encodedRef = encodeURIComponent(ref || "HEAD");
  return `https://api.github.com/repos/${owner}/${name}/tarball/${encodedRef}`;
}

/** Streams an HTTP response to disk while enforcing the compressed archive size limit. */
async function downloadResponseBody(response, archivePath, maxArchiveBytes) {
  if (!response.body) {
    throw new Error("GitHub repository archive response did not contain a body.");
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxArchiveBytes) {
    throw new Error(`Repository archive exceeds the ${maxArchiveBytes}-byte download limit.`);
  }

  const responseStream = typeof response.body.getReader === "function"
    ? Readable.fromWeb(response.body)
    : response.body;
  await pipeline(
    responseStream,
    createByteLimitTransform(maxArchiveBytes, "Repository archive"),
    createWriteStream(archivePath)
  );
}

/** Creates a pass-through stream that aborts when accumulated data exceeds a byte limit. */
function createByteLimitTransform(maxBytes, resourceName) {
  let receivedBytes = 0;

  return new Transform({
    transform(chunk, _encoding, callback) {
      receivedBytes += chunk.length;
      if (receivedBytes > maxBytes) {
        callback(new Error(`${resourceName} exceeds the ${maxBytes}-byte limit.`));
        return;
      }

      callback(null, chunk);
    }
  });
}

/** Extracts a GitHub tarball without links and limits the total declared extracted size. */
async function extractRepositoryArchive({ archivePath, destinationDirectory, maxExtractedBytes }) {
  let extractedBytes = 0;

  await extractTar({
    file: archivePath,
    cwd: destinationDirectory,
    gzip: true,
    strip: 1,
    preservePaths: false,
    noChmod: true,
    strict: true,
    filter(_entryPath, entry) {
      if (entry.type === "SymbolicLink" || entry.type === "Link") {
        return false;
      }

      extractedBytes += Number(entry.size) || 0;
      if (extractedBytes > maxExtractedBytes) {
        throw new Error(
          `Extracted repository exceeds the ${maxExtractedBytes}-byte size limit.`
        );
      }

      return true;
    }
  });
}

/** Reads a positive integer setting and returns a stable default for invalid values. */
function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
