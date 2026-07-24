# proto-frames

> Generate fast, monochrome mid-fidelity wireframes from inside your AI agent.

You describe a feature (or point at a spec file). The agent proposes screens, you approve, and a prebuilt React app opens in your browser showing tabs, states, nav, kind glyphs, and a clickable prototype. Feedback flows back to the agent over MCP or clipboard.

Pairs with [feature-spec](https://npmjs.com/package/feature-spec): that skill produces a structured `docs/specs/<feature>.md`, this one consumes it.

---

## Install

```bash
npx proto-frames install          # auto-detect agents in your project
```

Or target a specific agent:

```bash
npx proto-frames install claude          # Claude Code — global (~/.claude/skills/)
npx proto-frames install claude-project  # Claude Code — project (.claude/skills/)
npx proto-frames install cursor          # Cursor (.cursor/rules/)
npx proto-frames install windsurf        # Windsurf (.windsurf/rules/)
npx proto-frames install kilocode        # Kilocode (.kilocode/rules/)
npx proto-frames install copilot         # GitHub Copilot (.github/copilot-instructions.md)
npx proto-frames install amp-code        # Amp Code (~/.config/amp/settings.json)
npx proto-frames install codex           # Codex (~/.codex/AGENTS.md)
npx proto-frames install antigravity     # Antigravity (.agents/plugins/)
npx proto-frames install agents          # Generic (.agents/skills/)
```

```bash
npx proto-frames uninstall            # auto-detect and remove
npx proto-frames uninstall cursor     # remove from one platform
npx proto-frames list                 # list all supported platforms
```

> `pnpm dlx` and `bunx` work everywhere `npx` does.

---

## MCP server (optional, recommended for local harnesses)

The skill works without MCP using clipboard copy-paste. With MCP, the browser streams feedback directly back to the agent.

Register the server in your harness after installing the skill:

```bash
npx proto-frames mcp claude-project  # Claude Code → .mcp.json
npx proto-frames mcp cursor          # Cursor → .cursor/mcp.json
npx proto-frames mcp windsurf        # Windsurf → ~/.codeium/windsurf/mcp_config.json
npx proto-frames mcp copilot         # GitHub Copilot (VS Code) → .vscode/mcp.json
npx proto-frames mcp kilocode        # Kilocode → .kilocode/mcp.json
npx proto-frames mcp amp-code        # Amp Code → ~/.config/amp/settings.json
npx proto-frames mcp antigravity     # Antigravity → ~/.gemini/config/mcp_config.json
```

```bash
npx proto-frames mcp                 # print config snippet for every harness
npx proto-frames mcp --print cursor  # print only, never edit
npx proto-frames mcp --remove cursor # unregister
```

For harnesses with non-JSON configs (Codex TOML, Cline VS Code storage), the command prints the snippet for manual setup instead of editing.

### MCP tools

| Tool | Description |
|------|-------------|
| `wireframe_open` | Accept model JSON, serve on localhost, open browser |
| `wireframe_update` | Swap in-memory model, auto-reload browser |
| `wireframe_wait_feedback` | Block until next feedback or approval arrives |
| `wireframe_poll_feedback` | Non-blocking drain of pending feedback |
| `wireframe_status` | Returns `{ approved, openComments, url }` |

> Requires a local execution environment — pure cloud chat surfaces have no localhost and use the clipboard flow instead.

---

## Usage

Once the skill is installed, invoke it inside your agent:

```
/proto-frames
```

Point it at whatever you have:

| Input | Example |
|-------|---------|
| Feature spec file | `wireframe the refund flow from docs/specs/refund-flow.md` |
| Plain description | `show me the screens for letting users invite teammates` |
| Pasted endpoints | paste route definitions + say `wireframe this` |
| Nothing | just describe the feature — skill proposes screens, you prune |

The skill proposes the screen list as text first (cheap to edit), then draws only after you approve.

---

## What renders

You author a `screens → states → nodes` JSON model (schema in [SKILL.md](SKILL.md)). The prebuilt app turns it into:

- **Screen tabs** — one per screen
- **State tabs** — per screen, only for states that matter (`default`, `empty`, `error`, `permission-denied`)
- **Enumerated nav** — actual menu items grouped by IA, not one anonymous "Sidebar" block
- **Kind glyphs** — `kpi`, `chart:donut`, `chart:line`, `chart:bars`, `card`, `table`, `form`, `button`, … render as recognizable grey shapes, never real data
- **Clickable prototype** — `goto:"<screenId>"` switches screen, `opens:"<modalId>"` opens a modal overlay
- **Hover annotations** — `backend` (column / endpoint / permission touched) and `ds` (design-system component, or `guess:` if no vocabulary)
- **Feedback layer** — click a box, type a note, hit **Send to agent** (MCP) or **Copy feedback block** (clipboard)

Strictly monochrome — layout, IA, and flow only. No colors, real copy, or production styling.

---

## Pair with feature-spec

```bash
npx feature-spec install        # install the spec skill
npx proto-frames install   # install this skill
```

Then in your agent:

```
/feature-spec       → writes docs/specs/refund-flow.md
/proto-frames  → reads it, proposes screens, opens wireframe
```

---

## Development

```bash
npm install
npm run dev    # Vite dev server for the React renderer (app/src/)
npm run build  # Tailwind → assets/wireframe.css, Vite → assets/dist/wireframe-app.js
npm test       # node test/smoke.mjs && node test/cli-mcp.mjs
```

Agents never edit `app/src/`, `wireframe.css`, or `wireframe-app.js` -- only the JSON model passed to the MCP tools. See [CLAUDE.md](CLAUDE.md) for architecture details.

---

## License

MIT
