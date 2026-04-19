# Bhisma Frontend

React + Vite client for running LLM security workflows:

- Dashboard live summary
- Models management
- Attack selection
- Manual test and auto-scan execution
- Results review and export
- Defenses sandbox
- Run comparison

## Tech stack

- React 19
- Vite 7
- Zustand (persisted store)
- Axios
- Lucide React

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

Latest local test evidence:

- `Test Files 5 passed (5)`
- `Tests 32 passed (32)`
- `Duration 70.94s`

Run lint:

```bash
npm run lint
```

## Environment variables

`frontend/.env`:

- `VITE_API_URL=http://localhost:3001`

If omitted, the app defaults to local backend URL in development.

## App integration notes

- Global state is in `src/store/useStore.js` and persisted to localStorage.
- Active tab is validated at app shell level and falls back to `dashboard` if persisted value is invalid.
- Toast notifications are rendered globally via `src/components/Toast.jsx`.
- API wrappers are in `src/services/api.js` with normalized Axios error messages.
- Export helpers are in `src/services/reportService.js`.

## Feature behavior (current)

### Dashboard

- Live counts from store data
- Recent tests sorted by `createdAt`
- Quick actions to navigate flow

### Models

- Load/add/test/delete with toasts
- Provider-aware form validation and normalized payloads
- Ollama endpoint is normalized to `/v1` for OpenAI-compatible local routing

### Attacks

- Fetch attacks/categories from backend
- Category + search filtering
- Selection sync with store and invalid-id pruning after reload
- Loading/error/empty states

### Test

- Manual test loop against selected attacks
- Auto-scan trigger
- Progress display and cancellation
- Graceful error toasts and state reset

### Results

- History/search/filter rendering with safe null handling
- Delete with confirm state
- Copy prompt/response actions
- Batch/single export actions with operation-level error handling

### Defenses

- Defense list loading state + error state
- Prompt transformation execute flow with selected defense IDs
- Before/after output display

### Compare

- Two-run selection and client-side comparison metrics
- Backend recommendation fetch via `/compare/analyze` with fallback if unavailable

## Known limitations

- Frontend relies on local persisted store; no multi-user/session auth workflow.
- Comparison recommendations depend on backend analyze endpoint availability.
- Clipboard fallback path uses `document.execCommand('copy')` in older environments.

## Classroom demo quick model setup

1. Open Models page and click `Add Model`.
2. Choose provider:
	- `groq` or `openai`: add API key and model ID.
	- `ollama`: use local endpoint `http://localhost:11434/v1` and local model name.
	- `custom`: use OpenAI-compatible endpoint like `http://localhost:5000/v1` and matching model ID.
3. Click `Add Model` and then `Test Connection`.
4. If test fails, confirm local server is running and the model ID exists on that server.

## First-time user path (UI onboarding)

1. Add model
2. Test connection
3. Select attacks
4. Run manual test or auto-scan
5. Review results
6. Compare two runs
7. Apply defense and scan output

## Connection troubleshooting (practical checks)

- Is your local server running?
- Is endpoint correct, including `/v1` when required?
- Is the model ID valid on that server?
- Is API key required and valid?
- Is backend reachable from frontend (`VITE_API_URL`)?

## Classroom framing

This frontend is built for classroom demonstration and research exploration. It prioritizes clarity and repeatability over production-scale feature guarantees.
