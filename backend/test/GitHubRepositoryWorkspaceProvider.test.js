import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { c as createTar } from "tar";
import { GitHubRepositoryWorkspaceProvider } from "../src/analysis/GitHubRepositoryWorkspaceProvider.js";

/** Verifies authenticated archive transport and explicit workspace cleanup. */
test("GitHubRepositoryWorkspaceProvider materializes and cleans a repository ref", async (t) => {
  const temporaryRootDirectory = await mkdtemp(path.join(os.tmpdir(), "source-provider-test-"));
  t.after(async () => {
    await rm(temporaryRootDirectory, { recursive: true, force: true });
  });

  let requestedUrl = null;
  let requestedOptions = null;
  const provider = new GitHubRepositoryWorkspaceProvider({
    temporaryRootDirectory,
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-length": "3" }
      });
    },
    archiveExtractor: async ({ archivePath, destinationDirectory }) => {
      assert.deepEqual([...await readFile(archivePath)], [1, 2, 3]);
      await writeFile(
        path.join(destinationDirectory, "package.json"),
        "{\"name\":\"fixture\"}\n",
        "utf8"
      );
    }
  });

  const lease = await provider.materialize({
    repository: "owner/repository",
    ref: "feature/source-analysis",
    token: "secret-token"
  });

  assert.match(requestedUrl, /owner\/repository\/tarball\/feature%2Fsource-analysis$/);
  assert.equal(requestedOptions.headers.Authorization, "Bearer secret-token");
  assert.equal(JSON.parse(await readFile(path.join(lease.directory, "package.json"), "utf8")).name, "fixture");

  const temporaryDirectory = lease.temporaryDirectory;
  await lease.cleanup();
  await assert.rejects(() => access(temporaryDirectory));
  assert.deepEqual(await readdir(temporaryRootDirectory), []);
});

/** Verifies the production tar extractor strips GitHub's archive root directory. */
test("GitHubRepositoryWorkspaceProvider extracts a GitHub-style tarball", async (t) => {
  const temporaryRootDirectory = await mkdtemp(path.join(os.tmpdir(), "source-provider-tar-test-"));
  t.after(async () => {
    await rm(temporaryRootDirectory, { recursive: true, force: true });
  });

  const archiveSourceDirectory = path.join(temporaryRootDirectory, "archive-source");
  const repositoryRootDirectory = path.join(archiveSourceDirectory, "owner-repository-sha");
  const archivePath = path.join(temporaryRootDirectory, "fixture.tar.gz");
  await mkdir(path.join(repositoryRootDirectory, "src"), { recursive: true });
  await writeFile(
    path.join(repositoryRootDirectory, "package.json"),
    "{\"name\":\"archive-fixture\"}\n",
    "utf8"
  );
  await writeFile(path.join(repositoryRootDirectory, "src", "index.js"), "export {};\n", "utf8");
  await createTar({
    cwd: archiveSourceDirectory,
    file: archivePath,
    gzip: true
  }, ["owner-repository-sha"]);
  const archive = await readFile(archivePath);
  const provider = new GitHubRepositoryWorkspaceProvider({
    temporaryRootDirectory,
    fetchImpl: async () => new Response(archive, { status: 200 })
  });

  const lease = await provider.materialize({ repository: "owner/repository", ref: "main" });

  assert.equal(
    JSON.parse(await readFile(path.join(lease.directory, "package.json"), "utf8")).name,
    "archive-fixture"
  );
  assert.equal(await readFile(path.join(lease.directory, "src", "index.js"), "utf8"), "export {};\n");
  await lease.cleanup();
});

/** Verifies compressed archive limits are enforced before extraction. */
test("GitHubRepositoryWorkspaceProvider rejects oversized repository archives", async (t) => {
  const temporaryRootDirectory = await mkdtemp(path.join(os.tmpdir(), "source-provider-limit-test-"));
  t.after(async () => {
    await rm(temporaryRootDirectory, { recursive: true, force: true });
  });

  let extractorCalled = false;
  const provider = new GitHubRepositoryWorkspaceProvider({
    temporaryRootDirectory,
    maxArchiveBytes: 2,
    fetchImpl: async () => new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "content-length": "3" }
    }),
    archiveExtractor: async () => {
      extractorCalled = true;
    }
  });

  await assert.rejects(
    () => provider.materialize({ repository: "owner/repository", ref: "main" }),
    /exceeds the 2-byte download limit/
  );
  assert.equal(extractorCalled, false);
  assert.deepEqual(await readdir(temporaryRootDirectory), []);
});
