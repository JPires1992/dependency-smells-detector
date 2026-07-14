# Dependency-smells-detector backend

Analysis and Scoring Layer for detecting, scoring, and exporting software supply chain smells in React/npm projects.

## Architecture

The backend follows the prototype design described in the dissertation:

- `src/analysis`: project inspection, npm `package-lock.json` graph extraction, and analysis orchestration.
- `src/detectors`: modular detector interface and registry. External tools and custom detectors are isolated from scoring and exporters.
- `src/detectors/dirty-waters`: Dirty-Waters adapter, automatic installer, command runner, and static-result parser.
- `src/scoring`: SSSS implementation with the documented S, P, V, and R dimensions and final rating mapping.
- `src/exporters`: JSON contract for the Web Application Layer and Markdown report for CI/CD or textual inspection.

The current backend runtime supports npm only, and the CLI does not expose package-manager selection. npm is defined as the prototype default package manager in `src/domain/PackageManager.js`. Future package-manager support should be added by introducing focused modules for lockfile inspection and detector preparation, then wiring them at the orchestration boundary without changing the exported JSON contract.

For local project paths, the backend reads `package-lock.json` directly to build dependency context. For remote `owner/repo` targets, the backend does not clone the repository; Dirty-Waters reads the remote npm artefacts internally, and the exported JSON graph is projected from the parent paths returned in Dirty-Waters evidence. To keep large projects usable in the frontend, this graph intentionally contains only packages with smells and their immediate parents.

## Dirty-Waters Integration

Dirty-Waters is integrated through `DirtyWatersAdapter`. The adapter:

- checks whether `dirty-waters` is available on `PATH`;
- installs it automatically when missing, using `pip install git+https://github.com/chains-project/dirty-waters.git`;
- runs the static checks supported by Dirty-Waters for npm;
- parses the generated `*_static_results.json` file into smell findings;
- keeps `GITHUB_API_TOKEN` out of JSON and Markdown outputs.

On Windows, the adapter also creates temporary npm command shims under the system temp directory. This avoids failures where Dirty-Waters cannot resolve `npm` when it extracts dependencies internally.

The Dirty-Waters package-manager preflight remains generic inside the adapter because Dirty-Waters supports more package managers than the current prototype exposes. In the current pipeline it is always called with npm.

Required environment:

```powershell
$env:GITHUB_API_TOKEN = "<github-api-token>"
```

For local project analysis, Dirty-Waters still needs a GitHub repository path in `owner/repo` format. Provide it through either CLI or environment:

```powershell
$env:GITHUB_REPOSITORY_PATH = "owner/react-project"
```

Optional environment:

```powershell
$env:DIRTY_WATERS_AUTO_INSTALL = "false"
$env:DIRTY_WATERS_INSTALL_SOURCE = "git+https://github.com/chains-project/dirty-waters.git"
$env:DIRTY_WATERS_EXECUTABLE = "dirty-waters"
$env:DIRTY_WATERS_PIP_COMMAND = "pip"
$env:DIRTY_WATERS_TIMEOUT_MS = "3600000"
```

## Usage

Run commands from this folder:

```powershell
cd backend
```

Run a local React/npm project and generate both outputs.

Using the npm script:

```powershell
npm.cmd run analyze -- --target C:\path\to\project --github-repo owner/react-project --output reports
```

Using Node directly:

```powershell
node src/cli.js analyze --target C:\path\to\project --github-repo owner/react-project --output reports
```

Run against a GitHub repository identifier.

Using the npm script:

```powershell
npm.cmd run analyze -- --target owner/react-project --output reports
```

Using Node directly:

```powershell
node src/cli.js analyze --target owner/react-project --output reports
```

When `--ref` is omitted for a remote `owner/repo` target, the backend resolves the GitHub repository `default_branch`, uses it for remote file fetching and Dirty-Waters, and records it in `project.analysedRef` in the JSON output. If the lookup fails, the analysis continues with tool defaults and emits a warning.

Run against a specific branch, tag, or commit SHA by keeping `--target` in `owner/repo` format and passing the Git ref through `--ref`:

```powershell
npm.cmd run analyze -- --target owner/react-project --ref main --output reports
```

The equivalent direct Node command is:

```powershell
node src/cli.js analyze --target owner/react-project --ref main --output reports
```

If Dirty-Waters times out on a larger repository, increase the timeout. The value is in milliseconds:

```powershell
npm.cmd run analyze -- --target owner/react-project --output reports --dirty-waters-timeout-ms 3600000
```

The equivalent direct Node command is:

```powershell
node src/cli.js analyze --target owner/react-project --output reports --dirty-waters-timeout-ms 3600000
```

Run the pipeline without Dirty-Waters, useful for validating local graph/export behavior:

```powershell
node src/cli.js analyze --target C:\path\to\project --skip-dirty-waters --output reports
```

Generated files:

- `analysis-results.json`: structured contract with `metadata`, `project`, `graph`, `smells`, and `summary`.
- `analysis-report.md`: concise Markdown report listing detected smells, affected packages, scores, and ratings.

The JSON `graph.edges` field is intentionally reduced. Each edge links an immediate parent package to a package affected by at least one smell:

```json
{
  "source": "parent-package@1.0.0",
  "target": "smelled-package@2.0.0",
  "relationship": "parent",
  "smellIds": ["SMELL-001"]
}
```

## Testing

```powershell
npm.cmd test
```
