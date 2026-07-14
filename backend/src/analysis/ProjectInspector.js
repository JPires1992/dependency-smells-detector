import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
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

  /** Detects whether the target is local or remote and returns analysis input context. */
  async inspect({ target, githubRepository = null, analysedRef = null, githubToken = null } = {}) {
    if (!target) {
      throw new Error("A target repository identifier or local project path is required.");
    }

    if (isGithubRepositoryIdentifier(target)) {
      return this.#inspectRepositoryIdentifier({ target, githubRepository, analysedRef, githubToken });
    }

    return this.#inspectLocalProject({ target, githubRepository });
  }

  /** Builds minimal project context for a GitHub repository identifier. */
  async #inspectRepositoryIdentifier({ target, githubRepository, analysedRef, githubToken }) {
    const repository = githubRepository || normalizeGithubRepository(target);
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

  /** Reads local package metadata and extracts the dependency graph when supported. */
  async #inspectLocalProject({ target, githubRepository }) {
    const projectDirectory = path.resolve(target);
    const packageJsonPath = path.join(projectDirectory, "package.json");
    const packageJson = await readJsonFile(packageJsonPath);
    const repository =
      githubRepository ||
      normalizeGithubRepository(packageJson.repository) ||
      normalizeGithubRepository(packageJson.homepage) ||
      normalizeGithubRepository(process.env.GITHUB_REPOSITORY_PATH);

    let graph;
    const warnings = [];
    if (await fileExists(path.join(projectDirectory, "package-lock.json"))) {
      graph = await this.graphExtractor.extract(projectDirectory, packageJson);
    } else {
      graph = createRootOnlyGraph(packageJson);
      warnings.push("Dependency graph extraction requires an npm package-lock.json file.");
    }
    graph.rootDependencyTypesByName = buildRootDependencyTypesByName(packageJson);

    return {
      project: {
        name: packageJson.name || path.basename(projectDirectory),
        repository,
        packageManager: DEFAULT_PACKAGE_MANAGER,
        analysedRef: null,
        target: projectDirectory
      },
      graph,
      warnings
    };
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

/** Reads and parses a JSON file, wrapping parse and IO failures with path context. */
async function readJsonFile(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
}

/** Checks whether a filesystem path exists without leaking access errors. */
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
