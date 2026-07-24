import { PackageLockGraphExtractor, createRootOnlyGraph } from "./PackageLockGraphExtractor.js";
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
    const effectiveRef = await this.#resolveRemoteRef({ repository, analysedRef, githubToken, warnings });
    let packageJson = { name };
    let packageLock = null;

    try {
      packageJson = await this.githubPackageJsonFetcher.fetch({
        repository,
        ref: effectiveRef,
        token: githubToken
      });
    } catch (error) {
      warnings.push(`Could not fetch remote package.json from GitHub: ${error.message}`);
    }

    try {
      packageLock = await this.githubPackageJsonFetcher.fetchJsonFile({
        repository,
        filePath: "package-lock.json",
        ref: effectiveRef,
        token: githubToken
      });
    } catch (error) {
      warnings.push(`Could not fetch remote package-lock.json from GitHub: ${error.message}`);
    }

    const graph = packageLock
      ? this.graphExtractor.extractLockfile(packageLock, packageJson)
      : createRootOnlyGraph(packageJson);
    graph.rootDependencyTypesByName = buildRootDependencyTypesByName(packageJson);

    return {
      project: {
        name: packageJson.name || name,
        repository,
        packageManager: DEFAULT_PACKAGE_MANAGER,
        analysedRef: effectiveRef,
        target
      },
      graph,
      warnings
    };
  }

  /** Resolves the explicit ref or GitHub default branch used by all remote analysis steps. */
  async #resolveRemoteRef({ repository, analysedRef, githubToken, warnings }) {
    if (analysedRef) {
      return analysedRef;
    }

    try {
      const metadata = await this.githubPackageJsonFetcher.fetchRepositoryMetadata({
        repository,
        token: githubToken
      });

      if (metadata.defaultBranch) {
        return metadata.defaultBranch;
      }

      warnings.push("Could not resolve GitHub default branch; metadata response did not include default_branch.");
    } catch (error) {
      warnings.push(`Could not resolve GitHub default branch; analysis will use tool defaults: ${error.message}`);
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
