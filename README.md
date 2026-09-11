# dependency-smells-detector

ISEP - DIMEI 2026

This repository is organised as two applications, matching the prototype architecture from the dissertation.

## Structure

- `backend/`: Analysis and Scoring Layer. It analyses React/npm projects, invokes smell detectors, applies SSSS scoring, and exports JSON/Markdown artefacts.
- `frontend/`: React Web Application Layer. It loads backend JSON results and renders the projected dependency graph with Cytoscape.js.

## Prerequisites

The complete prototype requires:

- Node.js `^20.19.0` or `>=22.12.0`;
- npm;
- Python 3, `pip`, and Git for automatic Dirty-Waters installation;
- network access to GitHub, the npm Registry, and the external metadata services used by enabled analysers.

A GitHub API token is required for Dirty-Waters and improves GitHub API availability for the remaining backend modules. Configure it in the execution environment rather than in a JSON configuration file:

```powershell
$env:GITHUB_API_TOKEN = "<github-api-token>"
```

On Linux or macOS:

```bash
export GITHUB_API_TOKEN="<github-api-token>"
```

## Backend

Backend commands must be executed from `backend/`:

```powershell
cd backend
npm.cmd ci
npm.cmd run analyze -- --target owner/repository --output reports
```

See the [README](backend/README.md) for architecture, detector coverage, configuration, CLI usage, and output details.

## Frontend

Frontend commands must be executed from `frontend/`:

```powershell
cd frontend
npm ci
npm run dev
```

The React application loads backend JSON output files and renders the smell graph with Cytoscape. See [frontend/README.md](frontend/README.md) for feature and command details.


## Additional Documentation

- [`Literature-Review-and-Smell-Catalogue.md`](/docs/Literature-Review-and-Smell-Catalogue.md) - literature-review basis, adopted smell terminology, and baseline severity catalogue.
- [`Smell-Severity-Scoring-System.md`](/docs/Smell-Severity-Scoring-System.md) - SSSS dimensions, normalisation rules, scoring formula, and final rating mapping.
- [`Backend-Configuration-Reference.md`](/docs/Backend-Configuration-Reference.md) - complete backend configuration and credential reference.
