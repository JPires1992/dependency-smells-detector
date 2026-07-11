import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import { PackageLockGraphExtractor, createRootOnlyGraph } from "./PackageLockGraphExtractor.js";
import { GitHubPackageJsonFetcher } from "./GitHubPackageJsonFetcher.js";
import { isGithubRepositoryIdentifier, normalizeGithubRepository } from "../utils/GithubRepository.js";

/** Inspects the target project/repository and builds metadata plus dependency graph context. */
export class ProjectInspector {
  /** Allows dependency graph extraction to be replaced in tests or future package managers. */
  constructor({
    graphExtractor = new PackageLockGraphExtractor(),
    githubPackageJsonFetcher = new GitHubPackageJsonFetcher()
  } = {}) {
    this.graphExtractor = graphExtractor;
    this.githubPackageJsonFetcher = githubPackageJsonFetcher;
  }

  /** Detects whether the target is local or remote and returns analysis input context. */
  async inspect({ target, packageManager = null, githubRepository = null, analysedRef = null, githubToken = null } = {}) {
    if (!target) {
      throw new Error("A target repository identifier or local project path is required.");
    }

    if (isGithubRepositoryIdentifier(target)) {
      return this.#inspectRepositoryIdentifier({ target, packageManager, githubRepository, analysedRef, githubToken });
    }

    return this.#inspectLocalProject({ target, packageManager, githubRepository });
  }

  /** Builds minimal project context for a GitHub repository identifier. */
  async #inspectRepositoryIdentifier({ target, packageManager, githubRepository, analysedRef, githubToken }) {
    const repository = githubRepository || normalizeGithubRepository(target);
    const name = repository?.split("/")[1] ?? target;
    const warnings = packageManager
      ? []
      : ["Package manager could not be inferred from a remote identifier; defaulting to npm."];
    let packageJson = { name };

    try {
      packageJson = await this.githubPackageJsonFetcher.fetch({
        repository,
        ref: analysedRef,
        token: githubToken
      });
    } catch (error) {
      warnings.push(`Could not fetch remote package.json from GitHub: ${error.message}`);
    }

    return {
      project: {
        name: packageJson.name || name,
        repository,
        packageManager: packageManager || "npm",
        analysedRef,
        target
      },
      graph: {
        ...createRootOnlyGraph(packageJson),
        rootDependencyTypesByName: buildRootDependencyTypesByName(packageJson)
      },
      warnings
    };
  }

  /** Reads local package metadata and extracts the dependency graph when supported. */
  async #inspectLocalProject({ target, packageManager, githubRepository }) {
    const projectDirectory = path.resolve(target);
    const packageJsonPath = path.join(projectDirectory, "package.json");
    const packageJson = await readJsonFile(packageJsonPath);
    const detectedPackageManager = packageManager || (await detectPackageManager(projectDirectory));
    const repository =
      githubRepository ||
      normalizeGithubRepository(packageJson.repository) ||
      normalizeGithubRepository(packageJson.homepage) ||
      normalizeGithubRepository(process.env.GITHUB_REPOSITORY_PATH);

    let graph;
    const warnings = [];
    if (detectedPackageManager === "npm" && (await fileExists(path.join(projectDirectory, "package-lock.json")))) {
      graph = await this.graphExtractor.extract(projectDirectory, packageJson);
    } else {
      graph = createRootOnlyGraph(packageJson);
      warnings.push(`Dependency graph extraction is currently implemented for npm package-lock.json; got ${detectedPackageManager}.`);
    }
    graph.rootDependencyTypesByName = buildRootDependencyTypesByName(packageJson);

    return {
      project: {
        name: packageJson.name || path.basename(projectDirectory),
        repository,
        packageManager: detectedPackageManager,
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

/** Detects the JavaScript package manager from lockfile artefacts. */
async function detectPackageManager(projectDirectory) {
  if (await fileExists(path.join(projectDirectory, "package-lock.json"))) {
    return "npm";
  }

  if (await fileExists(path.join(projectDirectory, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (await fileExists(path.join(projectDirectory, "yarn.lock"))) {
    const yarnLock = await readFile(path.join(projectDirectory, "yarn.lock"), "utf8");
    return yarnLock.includes("__metadata:") ? "yarn-berry" : "yarn-classic";
  }

  throw new Error("Could not identify an npm, yarn, or pnpm dependency artifact in the target project.");
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
