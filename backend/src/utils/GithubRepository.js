/** Checks whether a value is already in GitHub owner/repository format. */
export function isGithubRepositoryIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value.trim());
}

/** Normalizes GitHub repository URLs, SSH remotes, or package metadata into owner/repo. */
export function normalizeGithubRepository(value) {
  if (!value) {
    return null;
  }

  const raw = typeof value === "string" ? value : value.url;
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (isGithubRepositoryIdentifier(trimmed)) {
    return trimmed;
  }

  const withoutGitPrefix = trimmed.replace(/^git\+/, "");
  const sshMatch = withoutGitPrefix.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return sshMatch[1];
  }

  try {
    const url = new URL(withoutGitPrefix);
    if (url.hostname.toLowerCase() !== "github.com") {
      return null;
    }

    const parts = url.pathname.replace(/^\/|\/$/g, "").replace(/\.git$/i, "").split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}
