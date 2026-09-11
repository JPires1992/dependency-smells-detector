# Dependency-smells-detector backend

Analysis and Scoring Layer for detecting, scoring, prioritising, and exporting software supply chain smells in React/npm projects.

## Architecture

The backend follows the prototype architecture described in the dissertation and is organised into focused modules:

- `src/analysis`: project inspection, npm dependency-graph extraction, and analysis orchestration.
- `src/composition`: composition root that assembles detectors, analysers, scoring, and exporters.
- `src/configuration`: validated configuration loading and overrides.
- `src/detectors`: modular smell detectors and external-tool adapters.
- `src/registry`: shared npm Registry access.
- `src/vulnerabilities`: vulnerability analysis and finding enrichment.
- `src/responsiveness`: package activity and update-strategy analysis.
- `src/scoring`: SSSS calculation and final rating mapping.
- `src/exporters`: JSON and Markdown report generation.
- `src/utils`: shared filesystem, process, concurrency, and parsing utilities.

The current runtime supports npm only. Repository targets are supplied in GitHub `owner/repo` format; local paths are intentionally not supported because part of the analysis pipeline relies on remote repository evidence. The backend retrieves the project manifest and available npm lockfile (`package-lock.json` or `npm-shrinkwrap.json`) from the analysed GitHub ref and correlates detector findings with the resulting dependency graph.

Internally, findings are matched using exact graph node identifiers whenever possible. Otherwise, `package@version` identity is used, while name-only matching is accepted only when it identifies a unique graph node. The exported graph is intentionally reduced to packages with detected smells and their immediate parents so that the frontend remains focused and usable on larger projects.

## Supported Detectors

The backend composes independent detector components that return a common finding structure.

| Detector | Smells |
| --- | --- |
| `CustomSmellDetector` | Pinned Dependency; Hardcoded URL; Restrictive Constraint; Permissive Constraint; No Package-Lock |
| `SourceUsageSmellDetector` + `KnipAdapter` | Unused Dependency; Missing Dependency |
| `PeerSpinDetector` | Peer Dependency Resolving Loop (PeerSpin) |
| `DirtyWatersAdapter` | No Source Code URL; Invalid Source Code URL; Inaccessible Commit SHA/Release Tag; Deprecated; Fork; No Code Signature; Invalid Code Signature; No Provenance; Aliased |
| `PackageGovernanceDetector` | Expired Maintainer Domain; Install Script Execution; Too Many Maintainers; Too Many Contributors |

The custom detector evaluates dependency declarations from `dependencies`, `devDependencies`, and `optionalDependencies`. It uses `npm-package-arg` and `semver` to interpret npm package specifiers and version ranges.


## Analysis Pipeline

The backend first inspects the target repository and reconstructs the npm dependency graph from the project manifest and available lockfile. The configured smell detectors then analyse dependency declarations, source usage, package metadata, peer dependency conflicts, and Dirty-Waters results.

Detector outputs are normalised into a common finding representation and correlated with the dependency graph. Findings are then enriched with vulnerability information obtained through `npm audit` and GitHub advisory metadata, together with responsiveness information derived from npm release history, repository activity, direct dependency constraints, and available fix information.

The resulting S, P, V, and R dimensions are combined by the Smell Severity Scoring System (SSSS). Final results are exported as:

- `analysis-results.json`: structured contract consumed by the frontend.
- `analysis-report.md`: concise textual report for direct inspection or CI/CD usage.

Metadata-dependent modules follow an optional-versus-required execution policy. Optional failures are reported as warnings and do not prevent the remaining analysis from completing. Such outputs may represent a partial analysis, so the generated `warnings` section must be reviewed before interpreting smell counts and scores.

Detailed scoring rules are documented in [`Smell-Severity-Scoring-System.md`](../docs/Smell-Severity-Scoring-System.md).

## Configuration

Default non-secret settings are loaded from `config/default.json`. Optional overrides can be supplied through a partial JSON configuration file, environment variables, or CLI options.

Configuration precedence is:

```text
default.json < --config file < environment variables < CLI options
```

Credentials are supplied only through environment variables and are not written to generated JSON or Markdown reports.

A custom configuration file can be supplied with:

```powershell
npm.cmd run analyze -- --target owner/repository --config config/analysis.json --output reports
```

See [`Backend-Configuration-Reference.md`](../docs/Backend-Configuration-Reference.md) for the complete list of configuration properties, defaults, environment overrides, timeouts, retry settings, concurrency limits, and credential requirements.

## Usage

Run commands from the backend folder:

The examples below use `npm.cmd`, which is the reliable command variant for Windows PowerShell. On Linux and macOS, replace `npm.cmd` with `npm`.

```powershell
cd backend
npm.cmd ci
```

Analyse a GitHub repository and generate the JSON and Markdown reports:

```powershell
npm.cmd run analyze -- --target owner/repository --output reports
```

The CLI can also be invoked directly with Node.js on any supported platform. The same analysis options are accepted:

```bash
node src/cli.js analyze --target owner/repository --output reports
```

Analyse a specific branch, tag, or commit SHA:

```powershell
npm.cmd run analyze -- --target owner/repository --ref main --output reports
```

When `--ref` is omitted, the backend attempts to resolve the repository default branch and records the analysed reference in the generated JSON output.

List all supported CLI options through the npm script:

```powershell
npm.cmd run analyze -- --help
```

Or invoke the CLI help directly with Node.js:

```bash
node src/cli.js --help
```

Generated files:

- `analysis-results.json`
- `analysis-report.md`

## GitHub Actions

An example GitHub Actions workflow is available in the `examples` directory. It can be adapted for use under `.github/workflows` to execute the backend non-interactively and upload `analysis-results.json` and `analysis-report.md` as workflow artefacts.

The workflow exposes the optional `API_TOKEN` repository secret as `GITHUB_API_TOKEN` and falls back to the workflow-provided `github.token` when the secret is absent. Configure `API_TOKEN` with a suitable personal access token when the automatic token cannot access the target, particularly for private repositories outside the workflow repository.

## Testing

Run the backend test suite with:

```powershell
npm test
```
