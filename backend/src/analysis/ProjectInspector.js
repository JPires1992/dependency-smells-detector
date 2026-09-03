import { PackageLockGraphExtractor, createManifestGraph } from "./PackageLockGraphExtractor.js";
import { GitHubPackageJsonFetcher } from "./GitHubPackageJsonFetcher.js";
import { isGithubRepositoryIdentifier, normalizeGithubRepository } from "../utils/GithubRepository.js";
import { DEFAULT_PACKAGE_MANAGER } from "../domain/PackageManager.js";

/** Inspects the target project/repository and builds metadata plus dependency graph context. */
export class ProjectInspector {
  /** Allows dependency graph extraction to be replaced in tests. */
  constructor({
    graphExtractor = new PackageLockGraphExtractor(),
    githubPackageJsonFetcher = new GitHubPackageJsonFetcher()
  } = {}) {
    this.graphExtractor = graphExtractor;
    this.githubPackageJsonFetcher = githubPackageJsonFetcher;
  }

  /** Validates and inspects a GitHub repository target, returning analysis input context. */
  async inspect({ target, analysedRef = null, githubToken = null } = {}) {
    if (!target) {
      throw new Error("A GitHub repository target in owner/repo format is required.");
    }

    if (!isGithubRepositoryIdentifier(target)) {
      throw new Error("Local project paths are not supported. Use --target <owner/repo> and optionally --ref <branch-or-sha>.");
    }

    return this.#inspectRepositoryIdentifier({ target, analysedRef, githubToken });
  }

  /** Builds minimal project context for a GitHub repository identifier. */
  async #inspectRepositoryIdentifier({ target, analysedRef, githubToken }) {
    const repository = normalizeGithubRepository(target);
    const name = repository?.split("/")[1] ?? target;
    const warnings = [];
    const repositoryMetadata = await this.#fetchRepositoryMetadata({
      repository,
      analysedRef,
      githubToken,
      warnings
    });
    const effectiveRef = this.#resolveRemoteRef({ analysedRef, repositoryMetadata, warnings });
    let packageJson = { name };
    let packageJsonStatus = "unavailable";

    try {
      packageJson = await this.githubPackageJsonFetcher.fetch({
        repository,
        ref: effectiveRef,
        token: githubToken
      });
      packageJsonStatus = "present";
    } catch (error) {
      warnings.push(`Could not fetch remote package.json from GitHub: ${error.message}`);
    }

    const lockfileResult = await this.#fetchNpmLockfile({
      repository,
      effectiveRef,
      githubToken
    });
    if (lockfileResult.status === "unavailable") {
      warnings.push(`Could not fetch a remote npm lockfile from GitHub: ${lockfileResult.error.message}`);
    } else if (lockfileResult.status === "missing" && packageJsonStatus !== "present") {
      lockfileResult.status = "unavailable";
      warnings.push("Could not confirm whether an npm lockfile exists because package.json was unavailable.");
    }

    const graph = lockfileResult.document
      ? this.graphExtractor.extractLockfile(lockfileResult.document, packageJson)
      : createManifestGraph(packageJson);
    graph.rootDependencyTypesByName = buildRootDependencyTypesByName(packageJson);

    return {
      project: {
        name: packageJson.name || name,
        repository,
        packageManager: DEFAULT_PACKAGE_MANAGER,
        analysedRef: effectiveRef,
        repositoryMetadata,
        target
      },
      graph,
      manifests: {
        packageJson,
        packageJsonStatus,
        packageLock: lockfileResult.document,
        lockfileStatus: lockfileResult.status,
        lockfilePath: lockfileResult.path,
        checkedLockfilePaths: ["package-lock.json", "npm-shrinkwrap.json"]
      },
      warnings
    };
  }

  /** Fetches the first npm lockfile supported by the current backend without hiding API failures. */
  async #fetchNpmLockfile({ repository, effectiveRef, githubToken }) {
    for (const filePath of ["package-lock.json", "npm-shrinkwrap.json"]) {
      try {
        const document = await this.githubPackageJsonFetcher.fetchJsonFile({
          repository,
          filePath,
          ref: effectiveRef,
          token: githubToken
        });
        return { status: "present", path: filePath, document, error: null };
      } catch (error) {
        if (error.statusCode !== 404) {
          return { status: "unavailable", path: null, document: null, error };
        }
      }
    }

    return { status: "missing", path: null, document: null, error: null };
  }

  /** Retrieves repository metadata once for branch resolution and project-root scoring. */
  async #fetchRepositoryMetadata({ repository, analysedRef, githubToken, warnings }) {
    try {
      return await this.githubPackageJsonFetcher.fetchRepositoryMetadata({
        repository,
        token: githubToken
      });
    } catch (error) {
      warnings.push(analysedRef
        ? `Could not fetch GitHub repository metadata for root responsiveness: ${error.message}`
        : `Could not resolve GitHub default branch; analysis will use tool defaults: ${error.message}`);
      return null;
    }
  }

  /** Resolves the explicit ref or GitHub default branch used by all remote analysis steps. */
  #resolveRemoteRef({ analysedRef, repositoryMetadata, warnings }) {
    if (analysedRef) {
      return analysedRef;
    }

    if (repositoryMetadata?.defaultBranch) {
      return repositoryMetadata.defaultBranch;
    }

    if (repositoryMetadata) {
      warnings.push("Could not resolve GitHub default branch; metadata response did not include default_branch.");
    }

    return null;
  }
}

/** Builds a root dependency type map from package.json dependency sections. */
export function buildRootDependencyTypesByName(packageJson = {}) {
  const dependencyTypes = {};

  for (const dependencyName of Object.keys(packageJson.devDependencies ?? {})) {
    dependencyTypes[dependencyName] = "development";
  }

  for (const dependencyName of [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {})
  ]) {
    dependencyTypes[dependencyName] = "production";
  }

  return dependencyTypes;
}
