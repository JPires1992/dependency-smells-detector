# dependency-smells-detector

ISEP - DIMEI 2026

This repository is organised as two applications, matching the prototype architecture from the dissertation.

## Structure

- `backend/`: Analysis and Scoring Layer. It analyses React/npm projects, invokes smell detectors, applies SSSS scoring, and exports JSON/Markdown artefacts.
- `frontend/`: Web Application Layer placeholder. This folder is reserved for the React visualisation application that will consume the backend JSON output.

## Backend

Backend commands must be executed from `backend/`:

```powershell
cd backend
npm.cmd test
```

See [backend/README.md](backend/README.md) for Dirty-Waters integration, environment variables, CLI usage, and output contracts.

## Frontend

Frontend commands must be executed from `frontend/`:

```powershell
cd frontend
npm install
npm run dev
```

The React application loads backend JSON output files and renders the smell graph with Cytoscape. See [frontend/README.md](frontend/README.md) for feature and command details.
