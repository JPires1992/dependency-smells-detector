# Backend Configuration Reference

The backend loads its baseline configuration automatically from [`backend/config/default.json`](../backend/config/default.json). An additional JSON file is optional and only needs to declare values that differ from the defaults.

Configuration sources are applied in this order, from lowest to highest precedence:

```text
default.json < --config file < environment variables < CLI options
```

Unknown properties, invalid types, empty strings, and non-positive numeric limits are rejected before analysis starts. JSON configuration files cannot contain comments.

## Detector Execution Policy

Detector sections can expose two independent execution settings:

- `enabled`: determines whether the module is added to the analysis pipeline. When `false`, the module is not executed.
- `required`: determines whether a module failure aborts the analysis. When `false`, the failure is converted to a warning whenever the module supports optional execution.

The normal best-effort policy is `"enabled": true` with `"required": false`: the detector runs, but a temporary external-tool or network failure does not prevent other modules from producing results.

## `dirtyWaters`

```json
{
  "dirtyWaters": {
    "enabled": true,
    "required": false,
    "timeoutMs": 1800000,
    "executable": "dirty-waters",
    "pipCommand": "pip",
    "installSource": "git+https://github.com/chains-project/dirty-waters",
    "autoInstall": true
  }
}
```

The `dirtyWaters` section controls the external Dirty-Waters adapter and its automatic installer.

- `enabled`: enables or disables Dirty-Waters detection.
- `required`: aborts the analysis when Dirty-Waters fails instead of recording a warning.
- `timeoutMs`: maximum duration, in milliseconds, of one Dirty-Waters analysis command.
- `executable`: preferred Dirty-Waters executable name or path. The installer also probes the known platform-specific executable names.
- `pipCommand`: Python package installer command or path used when automatic installation is required.
- `installSource`: package specification passed to `pip install`. The default tracks the `improvements` Git branch. Before reuse, the installer resolves the configured branch or tag and compares its current commit with the installed distribution. Exact Git commits and `dirty-waters==version` specifications are also supported.
- `autoInstall`: installs Dirty-Waters automatically when no usable executable is found. It also replaces an installed distribution when its source repository or resolved revision does not match `installSource`. When `false`, a missing or mismatched executable is reported as a detector failure.

## `npmRegistry`

```json
{
  "npmRegistry": {
    "registryUrl": "https://registry.npmjs.org",
    "timeoutMs": 30000,
    "maxAttempts": 3,
    "retryDelayMs": 250
  }
}
```

The `npmRegistry` section configures the shared npm metadata client used by package governance, PeerSpin, and responsiveness analysis.

- `registryUrl`: base URL of the npm-compatible registry.
- `timeoutMs`: maximum duration, in milliseconds, of each HTTP request attempt.
- `maxAttempts`: maximum number of attempts, including the initial request, for retryable transport and HTTP failures.
- `retryDelayMs`: base delay, in milliseconds, used by bounded exponential retry backoff.

Registry authentication is not stored in this section. Use `NPM_REGISTRY_TOKEN` or `NODE_AUTH_TOKEN` in the process environment.

## `npmAudit`

```json
{
  "npmAudit": {
    "required": false,
    "timeoutMs": 600000,
    "maxAttempts": 2,
    "retryDelayMs": 1000
  }
}
```

The `npmAudit` section configures vulnerability analysis used to calculate the SSSS `V` dimension.

- `required`: propagates npm audit execution or response errors and aborts the analysis. When `false`, supported failures produce a warning and vulnerability scoring uses the documented unavailable-evidence behavior.
- `timeoutMs`: maximum duration, in milliseconds, of each `npm audit --package-lock-only` command.
- `maxAttempts`: maximum number of attempts, including the first, for retryable npm audit endpoint failures.
- `retryDelayMs`: base delay, in milliseconds, between retryable audit attempts.

Command timeouts and permanent npm configuration errors are not retried.

## `githubAdvisories`

```json
{
  "githubAdvisories": {
    "apiUrl": "https://api.github.com/advisories",
    "apiVersion": "2026-03-10",
    "timeoutMs": 30000,
    "maxAttempts": 3,
    "retryDelayMs": 250,
    "concurrency": 4
  }
}
```

The `githubAdvisories` section configures structured advisory metadata retrieval used to calculate vulnerability persistence in the SSSS `V` dimension.

- `apiUrl`: base URL of the GitHub Global Security Advisory REST endpoint.
- `apiVersion`: GitHub REST API version sent in the `X-GitHub-Api-Version` header.
- `timeoutMs`: maximum duration, in milliseconds, of each advisory request attempt.
- `maxAttempts`: maximum number of attempts, including the first, for retryable transport and HTTP failures.
- `retryDelayMs`: base delay, in milliseconds, used by bounded exponential retry backoff.
- `concurrency`: maximum number of unique GHSA advisories requested concurrently.

Advisory requests are deduplicated by GHSA identifier. `GITHUB_API_TOKEN` is used when available; public advisories remain accessible without authentication, subject to GitHub's unauthenticated rate limits. A metadata failure preserves npm audit severity evidence and is reported as a partial warning.

## `packageGovernance`

```json
{
  "packageGovernance": {
    "enabled": true,
    "required": false,
    "concurrency": 4
  }
}
```

The `packageGovernance` section controls npm metadata checks for maintainer domains, install scripts, maintainer count, and contributor ratio.

- `enabled`: enables or disables all package-governance rules.
- `required`: aborts the analysis when npm Registry metadata or another mandatory detector prerequisite cannot be obtained. Inconclusive DNS or RDAP evidence remains a warning because an unavailable domain lookup cannot safely prove that a maintainer domain is expired.
- `concurrency`: maximum number of package versions evaluated concurrently.

## `domainLookup`

```json
{
  "domainLookup": {
    "dnsTimeoutMs": 10000,
    "rdapTimeoutMs": 15000,
    "rdapBootstrapUrl": "https://data.iana.org/rdap/dns.json"
  }
}
```

The `domainLookup` section bounds the independent checks used to confirm an `Expired Maintainer Domain` finding.

- `dnsTimeoutMs`: maximum duration, in milliseconds, of a DNS nameserver lookup.
- `rdapTimeoutMs`: maximum duration, in milliseconds, of each IANA bootstrap or authoritative RDAP HTTP request.
- `rdapBootstrapUrl`: authoritative RDAP service-discovery document used to resolve the endpoint for each top-level domain.

A domain is classified as expired only when both DNS and RDAP conclusively report it as unregistered.

## `responsiveness`

```json
{
  "responsiveness": {
    "required": false,
    "concurrency": 4
  }
}
```

The `responsiveness` section controls package activity analysis used to calculate the SSSS `R` dimension. It has no `enabled` setting because every scored finding requires explicit responsiveness evidence.

- `required`: aborts the analysis when package or project activity metadata is unavailable. When `false`, unavailable metadata is represented explicitly and scored according to the responsiveness policy.
- `concurrency`: maximum number of package activity profiles obtained concurrently.

## `peerSpin`

```json
{
  "peerSpin": {
    "enabled": true,
    "required": false,
    "maxConflicts": 100,
    "verificationConcurrency": 4,
    "maxTraversalNodes": 10000
  }
}
```

The `peerSpin` section configures `Peer Dependency Resolving Loop` candidate detection and npm Registry verification.

- `enabled`: enables or disables PeerSpin detection.
- `required`: aborts the analysis when the lockfile model or registry verification is unavailable instead of recording warnings.
- `maxConflicts`: maximum number of detected conflict candidates submitted for registry verification during one analysis.
- `verificationConcurrency`: maximum number of candidate registry verifications executed concurrently.
- `maxTraversalNodes`: maximum number of lockfile nodes traversed for one replacement-conflict candidate before that path is truncated.

PeerSpin uses the shared transport settings from `npmRegistry`.

## `sourceUsage`

```json
{
  "sourceUsage": {
    "enabled": true,
    "required": false,
    "timeoutMs": 300000,
    "downloadTimeoutMs": 120000,
    "maxArchiveBytes": 104857600,
    "maxExtractedBytes": 524288000
  }
}
```

The `sourceUsage` section controls repository materialization and Knip-based `Unused Dependency` and `Missing Dependency` detection.

- `enabled`: enables or disables source-usage detection.
- `required`: aborts the analysis when the repository snapshot or Knip analysis fails instead of recording a warning.
- `timeoutMs`: maximum duration, in milliseconds, of the Knip process.
- `downloadTimeoutMs`: maximum duration, in milliseconds, of the GitHub repository archive request.
- `maxArchiveBytes`: maximum accepted compressed repository archive size, in bytes.
- `maxExtractedBytes`: maximum total declared size of extracted archive entries, in bytes.

The default archive limits correspond to 100 MiB compressed and 500 MiB extracted.

## `output`

```json
{
  "output": {
    "schemaVersion": "1.0",
    "toolVersion": "0.1.0"
  }
}
```

The `output` section identifies the producer and JSON contract in report metadata.

- `schemaVersion`: version label written to `metadata.schemaVersion` in the JSON report.
- `toolVersion`: backend version label written to `metadata.toolVersion`.

Changing these labels does not migrate or transform the report structure. A schema change must be implemented in the exporter before its version label is updated.

## Custom Configuration File

A custom file should be partial and contain only values that differ from the defaults. For example:

```json
{
  "dirtyWaters": {
    "timeoutMs": 3600000
  },
  "npmAudit": {
    "timeoutMs": 900000,
    "maxAttempts": 3
  },
  "githubAdvisories": {
    "concurrency": 6
  },
  "packageGovernance": {
    "concurrency": 6
  }
}
```

Run the backend with the file:

```powershell
npm.cmd run analyze -- --target owner/repository --config config/analysis.json --output reports
```

## Environment Overrides

The following environment variables map to configuration properties and override values loaded from JSON:

| Environment variable | Configuration property |
|---|---|
| `DIRTY_WATERS_TIMEOUT_MS` | `dirtyWaters.timeoutMs` |
| `DIRTY_WATERS_EXECUTABLE` | `dirtyWaters.executable` |
| `DIRTY_WATERS_PIP_COMMAND` | `dirtyWaters.pipCommand` |
| `DIRTY_WATERS_INSTALL_SOURCE` | `dirtyWaters.installSource` |
| `DIRTY_WATERS_AUTO_INSTALL` | `dirtyWaters.autoInstall` |
| `NPM_REGISTRY_URL` | `npmRegistry.registryUrl` |
| `NPM_REGISTRY_TIMEOUT_MS` | `npmRegistry.timeoutMs` |
| `NPM_REGISTRY_MAX_ATTEMPTS` | `npmRegistry.maxAttempts` |
| `NPM_REGISTRY_RETRY_DELAY_MS` | `npmRegistry.retryDelayMs` |
| `NPM_AUDIT_TIMEOUT_MS` | `npmAudit.timeoutMs` |
| `NPM_AUDIT_MAX_ATTEMPTS` | `npmAudit.maxAttempts` |
| `NPM_AUDIT_RETRY_DELAY_MS` | `npmAudit.retryDelayMs` |
| `GITHUB_ADVISORY_API_URL` | `githubAdvisories.apiUrl` |
| `GITHUB_ADVISORY_API_VERSION` | `githubAdvisories.apiVersion` |
| `GITHUB_ADVISORY_TIMEOUT_MS` | `githubAdvisories.timeoutMs` |
| `GITHUB_ADVISORY_MAX_ATTEMPTS` | `githubAdvisories.maxAttempts` |
| `GITHUB_ADVISORY_RETRY_DELAY_MS` | `githubAdvisories.retryDelayMs` |
| `GITHUB_ADVISORY_CONCURRENCY` | `githubAdvisories.concurrency` |
| `PACKAGE_GOVERNANCE_CONCURRENCY` | `packageGovernance.concurrency` |
| `DOMAIN_LOOKUP_TIMEOUT_MS` | Both `domainLookup` timeout properties |
| `RDAP_BOOTSTRAP_URL` | `domainLookup.rdapBootstrapUrl` |
| `RESPONSIVENESS_CONCURRENCY` | `responsiveness.concurrency` |
| `PEER_SPIN_MAX_CONFLICTS` | `peerSpin.maxConflicts` |
| `PEER_SPIN_REGISTRY_CONCURRENCY` | `peerSpin.verificationConcurrency` |
| `PEER_SPIN_MAX_TRAVERSAL_NODES` | `peerSpin.maxTraversalNodes` |
| `SOURCE_USAGE_TIMEOUT_MS` | `sourceUsage.timeoutMs` |
| `SOURCE_USAGE_DOWNLOAD_TIMEOUT_MS` | `sourceUsage.downloadTimeoutMs` |
| `SOURCE_USAGE_MAX_ARCHIVE_BYTES` | `sourceUsage.maxArchiveBytes` |
| `SOURCE_USAGE_MAX_EXTRACTED_BYTES` | `sourceUsage.maxExtractedBytes` |

`PEER_SPIN_REGISTRY_TIMEOUT_MS` remains a legacy alias for `npmRegistry.timeoutMs`. `NPM_REGISTRY_TIMEOUT_MS` takes precedence when both are present.

## Credentials

Credentials are accepted only through the process environment and are kept separate from the validated application configuration:

- `GITHUB_API_TOKEN`: authenticates GitHub repository and advisory access and is required by Dirty-Waters.
- `NPM_REGISTRY_TOKEN`: authenticates access to an npm-compatible registry.
- `NODE_AUTH_TOKEN`: fallback npm Registry credential when `NPM_REGISTRY_TOKEN` is absent.

Credentials must not be added to `default.json`, custom configuration files, or generated reports.
