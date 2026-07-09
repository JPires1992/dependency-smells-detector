import { spawn } from "node:child_process";

/** Runs a child process and captures stdout, stderr, exit code, and signal. */
export function runCommand(command, args = [], options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    timeoutMs = 10 * 60 * 1000,
    stdin = null,
    shell = shouldUseShell(command)
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`Command timed out after ${timeoutMs}ms: ${command} ${args.join(" ")}`));
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (exitCode, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      resolve({ command, args, exitCode, signal, stdout, stderr });
    });

    if (stdin) {
      child.stdin?.write(stdin);
      child.stdin?.end();
    }
  });
}

/** Returns true when a command exits successfully, hiding process lookup failures. */
export async function commandSucceeds(command, args = [], options = {}) {
  try {
    const result = await runCommand(command, args, options);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/** Uses the Windows command shell only for batch-style launchers such as npm.cmd. */
function shouldUseShell(command) {
  return process.platform === "win32" && /\.(cmd|bat)$/i.test(command);
}
