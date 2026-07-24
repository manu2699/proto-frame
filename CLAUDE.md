# CLAUDE.md

## Commands

```bash
npm run dev       # Vite dev server for the React renderer app (app/src/)
npm run build     # Tailwind CSS → assets/wireframe.css, Vite → assets/dist/wireframe-app.js
npm test          # node test/smoke.mjs && node test/cli-mcp.mjs
```

Single test files can be run directly: `node test/smoke.mjs`

## Architecture

This package has two distinct surfaces that never overlap:

### 1. CLI (`bin/cli.js`)
Pure Node.js installer. Reads `SKILL.md` and copies it into agent rule directories (`.claude/skills/`, `.cursor/rules/`, etc). Also registers the MCP server into harness config files (`mcp.json`, etc). No build step — runs directly.

### 2. MCP server (`mcp/`)
- `server.js` — stdio MCP server using `@modelcontextprotocol/sdk`
- `tools.js` — tool definitions and dispatch (`wireframe_open`, `wireframe_update`, `wireframe_wait_feedback`, `wireframe_poll_feedback`, `wireframe_status`)
- `store.js` — in-memory model store (feature slug → `WFModel` JSON)
- `preview.js` — HTTP + SSE server; serves `assets/template.html` with the model injected, plus frozen `assets/wireframe.css` and `assets/dist/wireframe-app.js`; browser feedback arrives over HTTP POST

No files are written to the user's project. Everything is in-memory or served from `assets/`.

### 3. React renderer (`app/src/`)
Built with Vite + React + shadcn/ui + Tailwind 4. Compiled into `assets/dist/wireframe-app.js` (single bundle) and `assets/wireframe.css`. These are generated build artifacts — the MCP server serves them directly.

Key structure:
- `app/src/types.ts` — canonical `WFModel` / `WFNode` / `WFScreen` / `WFState` / `WFModal` type definitions
- `app/src/model/normalize.ts` — expands shorthands (`row[]`, `col[]`, `$ref`, single-state `nodes`) before render
- `app/src/render/` — one component per `Kind`; `registry.ts` maps kind strings to components; `Node.tsx` dispatches
- `app/src/ui/` — chrome: tabs, header, flow map, comment popover, review sidebar
- `app/src/ports/transport.ts` — SSE + HTTP POST client (receives model pushes via SSE + sends feedback to MCP via POST)

### Data flow

Agent → `wireframe_open(feature, model)` → `store.js` (in-memory) → HTTP serves HTML with model JSON embedded → React app boots, reads model from `window.__WF_MODEL__` → renders. Browser feedback → HTTP POST → `store.js` feedback queue → `wireframe_wait_feedback` returns to agent.

`wireframe_update` pushes a new model into store and sends an SSE reload signal; browser swaps model without page reload.

## Key invariants

- Agents author only the `WFModel` JSON — they never edit `app/src/`, `wireframe.css`, or `wireframe-app.js`
- `npm run build` must be run before publishing; `prepublishOnly` enforces this
- The `assets/` directory contains generated build output that the MCP server reads at runtime
- `SKILL.md` is the skill instruction file shipped to agents; it is the source of truth for the JSON schema the skill produces
