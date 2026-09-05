import { commandSucceeds, runCommand } from "../../utils/ChildProcess.js";
import {
  requireBoolean,
  requireNonEmptyString
} from "../../utils/ConfigurationValue.js";

/** Ensures Dirty-Waters is available, installing it automatically when configured. */
export class DirtyWatersInstaller {
  /** Configures executable lookup and pip installation behavior. */
  constructor({
    executable,
    pipCommand,
    installSource,
    autoInstall
  } = {}) {
    this.executable = requireNonEmptyString(executable, "dirtyWaters.executable");
    this.pipCommand = requireNonEmptyString(pipCommand, "dirtyWaters.pipCommand");
    this.installSource = requireNonEmptyString(
      installSource,
      "dirtyWaters.installSource"
    );
    this.autoInstall = requireBoolean(autoInstall, "dirtyWaters.autoInstall");
  }

  /** Returns a usable Dirty-Waters executable, installing from GitHub when missing. */
  async ensureInstalled({ env = process.env, cwd = process.cwd() } = {}) {
    const executable = await this.#findExecutable(env, cwd);
    if (executable) {
      return executable;
    }

    if (!this.autoInstall) {
      throw new Error("dirty-waters executable was not found and automatic installation is disabled.");
    }

    const installResult = await runCommand(this.pipCommand, ["install", this.installSource], {
      cwd,
      env,
      timeoutMs: 20 * 60 * 1000
    });

    if (installResult.exitCode !== 0) {
      throw new Error(`Failed to install dirty-waters with ${this.pipCommand}: ${installResult.stderr || installResult.stdout}`);
    }

    const installedExecutable = await this.#findExecutable(env, cwd);
    if (!installedExecutable) {
      throw new Error("dirty-waters installation completed, but the executable could not be found on PATH.");
    }

    return installedExecutable;
  }

  /** Probes known executable names using the Dirty-Waters help command. */
  async #findExecutable(env, cwd) {
    const candidates = [...new Set([this.executable, "dirty-waters", "dirty-waters.exe", "dirty-waters.cmd"])];
    const checkEnv = {
      ...env,
      GITHUB_API_TOKEN: env.GITHUB_API_TOKEN || "installation-check"
    };

    for (const candidate of candidates) {
      if (await commandSucceeds(candidate, ["--help"], { cwd, env: checkEnv, timeoutMs: 30 * 1000 })) {
        return candidate;
      }
    }

    return null;
  }
}
