import test from "node:test";
import assert from "node:assert/strict";
import { GitHubAdvisoryClient } from "../src/vulnerabilities/GitHubAdvisoryClient.js";
import { resolveConfiguration } from "../src/configuration/ConfigurationLoader.js";

const TEST_CONFIGURATION = resolveConfiguration();

/** Verifies advisory responses are normalized, authenticated, and cached by GHSA id. */
test("GitHubAdvisoryClient fetches and caches public advisory metadata", async () => {
  const requests = [];
  const client = new GitHubAdvisoryClient({
    ...withoutConcurrency(TEST_CONFIGURATION.githubAdvisories),
    token: "github-token",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return jsonResponse({
        ghsa_id: "GHSA-AAAA-BBBB-CCCC",
        published_at: "2025-01-01T00:00:00Z",
        withdrawn_at: null
      });
    }
  });

  const [first, second] = await Promise.all([
    client.getAdvisory("ghsa-aaaa-bbbb-cccc"),
    client.getAdvisory("GHSA-AAAA-BBBB-CCCC")
  ]);

  assert.deepEqual(first, {
    ghsaId: "GHSA-AAAA-BBBB-CCCC",
    publishedAt: "2025-01-01T00:00:00Z",
    withdrawnAt: null
  });
  assert.equal(first, second);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.github.com/advisories/GHSA-AAAA-BBBB-CCCC");
  assert.equal(requests[0].options.headers.Authorization, "Bearer github-token");
  assert.equal(
    requests[0].options.headers["X-GitHub-Api-Version"],
    TEST_CONFIGURATION.githubAdvisories.apiVersion
  );
});

/** Verifies transient GitHub responses use bounded retries before returning metadata. */
test("GitHubAdvisoryClient retries transient HTTP responses", async () => {
  let attempts = 0;
  const delays = [];
  const client = new GitHubAdvisoryClient({
    ...withoutConcurrency(TEST_CONFIGURATION.githubAdvisories),
    maxAttempts: 2,
    retryDelayMs: 7,
    sleep: async (delayMs) => delays.push(delayMs),
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? jsonResponse({}, { ok: false, status: 503 })
        : jsonResponse({
            ghsa_id: "GHSA-DDDD-EEEE-FFFF",
            published_at: "2025-02-01T00:00:00Z",
            withdrawn_at: null
          });
    }
  });

  const advisory = await client.getAdvisory("GHSA-DDDD-EEEE-FFFF");

  assert.equal(advisory.publishedAt, "2025-02-01T00:00:00Z");
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [7]);
});

/** Removes the worker-only setting before constructing the HTTP client. */
function withoutConcurrency(configuration) {
  const { concurrency: _concurrency, ...clientOptions } = configuration;
  return clientOptions;
}

/** Creates the subset of Fetch Response behavior required by the advisory client. */
function jsonResponse(document, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    headers: { get: () => null },
    async json() {
      return document;
    }
  };
}
