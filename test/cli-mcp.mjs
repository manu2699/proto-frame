// Phase 3: `proto-frames mcp` cross-harness registration.
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const CLI = path.join(root, "bin", "cli.js");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wf-cli-"));
}
function run(args, cwd, extraEnv = {}) {
  return execFileSync("node", [CLI, ...args], {
    cwd,
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd, ...extraEnv },
    encoding: "utf8",
  });
}
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// 1. register cursor → .cursor/mcp.json
let d = tmp();
run(["mcp", "cursor"], d);
let cfg = path.join(d, ".cursor", "mcp.json");
let obj = readJson(cfg);
assert.ok(obj.mcpServers["proto-frames"].args.includes("serve"), "cursor registered");
console.log("✓ mcp cursor → .cursor/mcp.json with proto-frames");

// 2. idempotent rerun → byte-identical + "already registered"
const before = fs.readFileSync(cfg, "utf8");
const out2 = run(["mcp", "cursor"], d);
assert.strictEqual(fs.readFileSync(cfg, "utf8"), before, "idempotent: file unchanged");
assert.ok(/already registered/.test(out2), "idempotent: message");
console.log("✓ rerun is idempotent");

// 3. preserve a user server + write .bak
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { other: { command: "x" } } }, null, 2));
run(["mcp", "cursor"], d);
obj = readJson(cfg);
assert.ok(obj.mcpServers.other, "preserved user server");
assert.ok(obj.mcpServers["proto-frames"], "added our server");
assert.ok(fs.existsSync(cfg + ".bak"), "wrote .bak");
console.log("✓ preserves existing servers + writes .bak");

// 4. JSONC comment → safety valve: file untouched, snippet printed
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
const commented = '{\n  // my servers\n  "mcpServers": {}\n}';
fs.writeFileSync(cfg, commented);
const out4 = run(["mcp", "cursor"], d);
assert.strictEqual(fs.readFileSync(cfg, "utf8"), commented, "commented config untouched");
assert.ok(/comments/.test(out4) && /add this MCP server manually/.test(out4), "printed snippet");
console.log("✓ JSONC comments → prints snippet, never clobbers");

// 5. copilot uses "servers" key in .vscode/mcp.json (VS Code Copilot agent mode)
d = tmp();
run(["mcp", "copilot"], d);
obj = readJson(path.join(d, ".vscode", "mcp.json"));
assert.ok(obj.servers && obj.servers["proto-frames"], "copilot uses servers key in .vscode/mcp.json");
assert.ok(!obj.mcpServers, "copilot has no mcpServers key");
console.log("✓ mcp copilot → .vscode/mcp.json with `servers` key");

// 5.4 claude (user scope) → ~/.claude.json with mcpServers key, preserves existing state
d = tmp();
fs.writeFileSync(
  path.join(d, ".claude.json"),
  JSON.stringify({ numStartups: 42, projects: { "/x": {} } }, null, 2),
);
run(["mcp", "claude"], d);
obj = readJson(path.join(d, ".claude.json"));
assert.ok(obj.mcpServers && obj.mcpServers["proto-frames"], "claude user scope registered in ~/.claude.json");
assert.strictEqual(obj.numStartups, 42, "claude: preserved existing state");
assert.ok(obj.projects["/x"], "claude: preserved projects");
console.log("✓ mcp claude → ~/.claude.json with `mcpServers` key, state preserved");

// 5.45 install with only ~/.claude → global skill AND user-scope MCP registered
d = tmp();
fs.mkdirSync(path.join(d, ".claude"), { recursive: true });
run(["install"], d);
assert.ok(
  fs.existsSync(path.join(d, ".claude", "skills", "proto-frames", "SKILL.md")),
  "install: global skill written",
);
obj = readJson(path.join(d, ".claude.json"));
assert.ok(obj.mcpServers && obj.mcpServers["proto-frames"], "install: user-scope MCP registered");
console.log("✓ install (global claude only) → skill + ~/.claude.json MCP registration");

// 5.5 antigravity → ~/.gemini/config/mcp_config.json (global, mcpServers key)
d = tmp();
run(["mcp", "antigravity"], d);
obj = readJson(path.join(d, ".gemini", "config", "mcp_config.json"));
assert.ok(obj.mcpServers && obj.mcpServers["proto-frames"], "antigravity uses mcpServers key");
console.log("✓ mcp antigravity → ~/.gemini/config/mcp_config.json with `mcpServers` key");

// 6. kilocode → .kilocode/mcp.json with mcpServers key
d = tmp();
run(["mcp", "kilocode"], d);
obj = readJson(path.join(d, ".kilocode", "mcp.json"));
assert.ok(obj.mcpServers && obj.mcpServers["proto-frames"], "kilocode uses mcpServers key");
assert.ok(!obj.servers, "kilocode has no servers key");
console.log("✓ mcp kilocode → .kilocode/mcp.json with `mcpServers` key");

// 7. amp-code → ~/.config/amp/settings.json with nested amp.mcpServers key
d = tmp();
run(["mcp", "amp-code"], d);
obj = readJson(path.join(d, ".config", "amp", "settings.json"));
assert.ok(obj.amp && obj.amp.mcpServers && obj.amp.mcpServers["proto-frames"], "amp-code uses nested amp.mcpServers key");
assert.ok(!obj["amp.mcpServers"], "amp-code writes nested object, not literal dot key");
console.log("✓ mcp amp-code → ~/.config/amp/settings.json with nested `amp.mcpServers` key");

// 8. codex MCP target is print-only (TOML) — writes nothing
d = tmp();
const out6 = run(["mcp", "codex"], d);
assert.ok(!fs.existsSync(path.join(d, ".codex", "config.toml")), "codex: no file written");
assert.ok(/\[mcp_servers\.proto-frames\]/.test(out6), "codex: TOML snippet printed");
console.log("✓ mcp codex → prints TOML, writes nothing");

// 7. --print never writes
d = tmp();
const out7 = run(["mcp", "--print", "cursor"], d);
assert.ok(!fs.existsSync(path.join(d, ".cursor", "mcp.json")), "--print: no file written");
assert.ok(/"proto-frames"/.test(out7), "--print: snippet printed");
console.log("✓ mcp --print cursor → prints, writes nothing");

// 8. --remove deletes only our key, leaves others
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { other: { command: "x" }, "proto-frames": { command: "npx" } } }, null, 2));
run(["mcp", "--remove", "cursor"], d);
obj = readJson(cfg);
assert.ok(obj.mcpServers.other, "remove: kept other");
assert.ok(!obj.mcpServers["proto-frames"], "remove: dropped ours");
console.log("✓ mcp --remove cursor → removes only our key");

console.log("\nPHASE 3 PASS");
process.exit(0);
