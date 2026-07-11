import https from "node:https";

/** Fetches package.json from GitHub repositories, including private repos when a token is provided. */
export class GitHubPackageJsonFetcher {
  /** Loads and parses package.json from the GitHub contents API. */
  async fetch({ repository, ref = null, token = null }) {
    const url = new URL(`https://api.github.com/repos/${repository}/contents/package.json`);
    if (ref) {
      url.searchParams.set("ref", ref);
    }

    const response = await requestJson(url, token);
    if (!response.content || response.encoding !== "base64") {
      throw new Error(`GitHub package.json response for ${repository} did not contain base64 content.`);
    }

    return JSON.parse(Buffer.from(response.content, "base64").toString("utf8"));
  }
}

/** Performs a GitHub API GET request and parses its JSON response. */
function requestJson(url, token) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "dependency-smells-detector",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`GitHub API returned ${response.statusCode}: ${body}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Failed to parse GitHub API response: ${error.message}`));
          }
        });
      }
    );

    request.on("error", reject);
    request.end();
  });
}
