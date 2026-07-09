import { readdir, stat } from "node:fs/promises";
import path from "node:path";

/** Recursively finds files below a root directory that satisfy the provided predicate. */
export async function findFilesByPredicate(rootDirectory, predicate) {
  const matches = [];

  /** Walks a directory tree and accumulates matching file metadata. */
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }

      if (entry.isFile() && predicate(fullPath, entry.name)) {
        const fileStat = await stat(fullPath);
        matches.push({ path: fullPath, mtimeMs: fileStat.mtimeMs });
      }
    }
  }

  await visit(rootDirectory);
  return matches.sort((a, b) => b.mtimeMs - a.mtimeMs);
}
