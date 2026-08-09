# Repository Guidelines

## Project Structure & Module Organization

- `server.js` contains the HTTP server, static-file serving, health endpoint, DataJud request, process-number normalization, and response summarization.
- `public/index.html` defines the single-page interface; `public/app.js` handles queries and rendering; `public/style.css` contains the layout and visual styles.
- `README.md` documents the DataJud purpose and environment setup. There is currently no test directory or separate backend/frontend package.

## Build, Test, and Development Commands

Install dependencies (and keep the lockfile current):

```bash
npm install
```

Run the server normally:

```bash
npm start
```

Run with Node’s watch mode during development:

```bash
npm run dev
```

The app listens on port `3000` by default. Set `PORT` to change it, and set `DATAJUD_API_KEY` before querying the API; `DATAJUD_URL` can override the default endpoint.

There is no automated build, test, or lint command configured. At minimum, verify `GET /api/health`, submit a known process number through `http://localhost:3000`, and inspect browser/server errors before opening a PR.

## Coding Style & Naming Conventions

Use modern ESM JavaScript, 2-space indentation, semicolons, and double-quoted strings in server-side code. Prefer small focused functions and descriptive `camelCase` names; use `UPPER_SNAKE_CASE` for environment-derived constants. Keep browser code compatible with current browsers and escape externally supplied values before inserting HTML. Preserve the existing lightweight, dependency-free architecture unless a dependency is justified.

## Testing Guidelines

No test framework or coverage threshold is currently present. For changes to API behavior, manually test valid, invalid, empty-result, and upstream-error cases. For UI changes, check both desktop and narrow/mobile layouts and confirm the raw JSON panel still behaves correctly.

## Commit & Pull Request Guidelines

Use concise imperative commit subjects with a conventional prefix, matching history (for example, `feat: add ...`, `style: improve ...`, or `docs: update ...`). PRs should explain the behavior changed, include setup/test steps, identify any new environment variables, and attach screenshots for visible UI changes. Keep unrelated refactors out of the same PR.

## Security & Configuration Tips

Never commit `DATAJUD_API_KEY` or `.env` files. Keep credentials server-side; do not expose them in `public/app.js` or returned client data. Treat upstream DataJud responses as untrusted input and preserve the existing HTML escaping when rendering fields.
