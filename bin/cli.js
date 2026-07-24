#!/usr/bin/env node

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_SRC = path.join(__dirname, "..", "SKILL.md");
const SKILL_CONTENT = fs.readFileSync(SKILL_SRC, "utf8");
const ASSETS_SRC = path.join(__dirname, "..", "assets");
const PKG_NAME = "proto-frames";
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")).version;

const genericAgentSkill = {
  label: "Generic Agent Skill",
  type: "copy",
  dest: () =>
    path.join(process.cwd(), ".agents", "skills", PKG_NAME, "SKILL.md"),
};

// Each platform entry: where to write, and how (copy vs append-section)
const PLATFORMS = {
  claude: {
    label: "Claude Code (global)",
    type: "copy",
    dest: () =>
      path.join(os.homedir(), ".claude", "skills", PKG_NAME, "SKILL.md"),
  },
  "claude-project": {
    label: "Claude Code (project)",
    type: "copy",
    dest: () =>
      path.join(process.cwd(), ".claude", "skills", PKG_NAME, "SKILL.md"),
  },
  cursor: {
    label: "Cursor",
    type: "copy",
    dest: () =>
      path.join(process.cwd(), ".cursor", "rules", PKG_NAME, `${PKG_NAME}.md`),
  },
  kilocode: {
    label: "Kilocode",
    type: "copy",
    dest: () =>
      path.join(
        process.cwd(),
        ".kilocode",
        "rules",
        PKG_NAME,
        `${PKG_NAME}.md`,
      ),
  },
  windsurf: {
    label: "Windsurf",
    type: "copy",
    dest: () =>
      path.join(
        process.cwd(),
        ".windsurf",
        "rules",
        PKG_NAME,
        `${PKG_NAME}.md`,
      ),
  },
  agents: {
    ...genericAgentSkill,
    label: "Agents folder (.agents/) - Generic",
  },
  codex: {
    label: "Codex (OpenAI)",
    type: "append",
    dest: () => path.join(os.homedir(), ".codex", "AGENTS.md"),
    section: `\n\n${SKILL_CONTENT}\n`,
  },
  antigravity: {
    label: "Antigravity",
    type: "copy",
    dest: () =>
      path.join(
        process.cwd(),
        ".agents",
        "plugins",
        PKG_NAME,
        "skills",
        PKG_NAME,
        "SKILL.md",
      ),
    pluginManifest: { name: PKG_NAME },
  },
  copilot: {
    label: "GitHub Copilot",
    type: "append",
    dest: () =>
      path.join(process.cwd(), ".github", "copilot-instructions.md"),
    section: `\n\n${SKILL_CONTENT}\n`,
  },
  "amp-code": {
    label: "Amp Code",
    type: "append",
    dest: () => path.join(process.cwd(), "AGENTS.md"),
    section: `\n\n${SKILL_CONTENT}\n`,
  },
};

// Copy only reference docs (DESIGN.md, feature-spec.md) next to the installed SKILL.md.
function copyAssets(dest) {
  if (!fs.existsSync(ASSETS_SRC)) return;
  const assetsDest = path.join(path.dirname(dest), "assets");
  fs.mkdirSync(assetsDest, { recursive: true });
  const docsOnly = ["DESIGN.md", "feature-spec.md"];
  for (const file of docsOnly) {
    const src = path.join(ASSETS_SRC, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(assetsDest, file));
    }
  }
  console.log(`  ↳ assets/ → ${assetsDest}`);
}

function writePlatform(name, platform) {
  const dest = platform.dest();

  if (platform.type === "copy") {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, SKILL_CONTENT, "utf8");
    console.log(`✓ ${platform.label} → ${dest}`);
    copyAssets(dest);
    if (platform.pluginManifest) {
      const manifestPath = path.join(
        process.cwd(),
        ".agents",
        "plugins",
        PKG_NAME,
        "plugin.json",
      );
      if (!fs.existsSync(manifestPath)) {
        fs.writeFileSync(manifestPath, JSON.stringify(platform.pluginManifest, null, 2) + "\n", "utf8");
        console.log(`  ↳ plugin.json → ${manifestPath}`);
      }
    }
    return;
  }

  if (platform.type === "append") {
    const marker = `<!-- proto-frames -->`;
    let existing = "";
    if (fs.existsSync(dest)) {
      existing = fs.readFileSync(dest, "utf8");
      if (existing.includes(marker)) {
        console.log(`  ${platform.label}: already installed, skipping`);
        return;
      }
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.writeFileSync(dest, existing + marker + platform.section, "utf8");
    console.log(`✓ ${platform.label} → ${dest}`);
  }
}

function removePlatform(name, platform) {
  const dest = platform.dest();

  if (platform.type === "copy") {
    // Every copy install now lives in a dedicated <PKG_NAME>/ folder (SKILL file + assets/),
    // so remove the whole folder. Fall back to unlinking the lone file for any legacy flat install.
    const dir = path.dirname(dest);
    if (path.basename(dir) === PKG_NAME && fs.existsSync(dir)) {
      if (platform.pluginManifest) {
        const pluginDir = path.join(process.cwd(), ".agents", "plugins", PKG_NAME);
        if (fs.existsSync(pluginDir)) {
          fs.rmSync(pluginDir, { recursive: true, force: true });
          console.log(`✓ removed ${platform.label} plugin → ${pluginDir}`);
        }
      } else {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✓ removed ${platform.label} → ${dir}`);
      }
    } else if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
      console.log(`✓ removed ${platform.label} → ${dest}`);
    } else {
      console.log(`  ${platform.label}: not installed`);
    }
    return;
  }

  if (platform.type === "append") {
    if (!fs.existsSync(dest)) {
      console.log(`  ${platform.label}: not installed`);
      return;
    }
    const marker = `<!-- proto-frames -->`;
    const content = fs.readFileSync(dest, "utf8");
    if (!content.includes(marker)) {
      console.log(`  ${platform.label}: not installed`);
      return;
    }
    const cleaned = content.slice(0, content.indexOf(marker)).trimEnd();
    fs.writeFileSync(dest, cleaned + "\n", "utf8");
    console.log(`✓ removed ${platform.label} → ${dest}`);
  }
}

function autoDetect() {
  const cwd = process.cwd();
  const home = os.homedir();
  const detected = [];

  // Global Claude Code install (~/.claude/ exists)
  if (fs.existsSync(path.join(home, ".claude"))) detected.push("claude");

  // Project-level platform dirs
  const projectChecks = [
    ["claude-project", ".claude"],
    ["cursor", ".cursor"],
    ["windsurf", ".windsurf"],
    ["kilocode", ".kilocode"],
    ["amp-code", ".amp"],
    ["agents", ".agents"],
  ];
  for (const [name, dir] of projectChecks) {
    if (fs.existsSync(path.join(cwd, dir))) detected.push(name);
  }

  if (detected.length === 0) {
    console.log("No known agent directories detected. Falling back to generic .agents/ folder.");
    detected.push("agents");
  }

  return detected;
}

// ── MCP server registration ─────────────────────────────────────────────────
// The skill (above) goes into a harness's rules/skills dir. The MCP server is
// separate: it must be registered in the harness's own MCP config. The launch
// command is identical everywhere (no global install); only the file + format
// differ. Strategy: auto-merge JSON where safe, print a snippet otherwise.

const MCP_NAME = PKG_NAME; // "proto-frames"
const MCP_SERVER = { command: "npx", args: ["-y", "proto-frames", "serve"] };

const MCP_TARGETS = {
  claude: {
    // User-scope MCP servers live in ~/.claude.json under a top-level "mcpServers"
    // key — same place `claude mcp add --scope user` writes. Registering here makes
    // the server available in every project, matching the global skill install.
    label: "Claude Code (user)",
    format: "json",
    key: "mcpServers",
    file: () => path.join(os.homedir(), ".claude.json"),
  },
  "claude-project": {
    label: "Claude Code (project)",
    format: "json",
    key: "mcpServers",
    file: () => path.join(process.cwd(), ".mcp.json"),
  },
  cursor: {
    label: "Cursor",
    format: "json",
    key: "mcpServers",
    file: () => path.join(process.cwd(), ".cursor", "mcp.json"),
  },
  kilocode: {
    label: "Kilocode",
    format: "json",
    key: "mcpServers",
    file: () => path.join(process.cwd(), ".kilocode", "mcp.json"),
  },
  windsurf: {
    label: "Windsurf",
    format: "json",
    key: "mcpServers",
    file: () =>
      path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json"),
  },
  copilot: {
    // VS Code Copilot agent mode reads .vscode/mcp.json with a "servers" key
    label: "GitHub Copilot (VS Code)",
    format: "json",
    key: "servers",
    file: () => path.join(process.cwd(), ".vscode", "mcp.json"),
  },
  codex: {
    label: "Codex (OpenAI)",
    format: "toml",
    file: () => path.join(os.homedir(), ".codex", "config.toml"),
  },
  cline: {
    label: "Cline",
    format: "print", // path lives deep in VS Code globalStorage, varies by OS/editor
    file: () => "<VS Code globalStorage>/.../cline_mcp_settings.json",
  },
  antigravity: {
    label: "Antigravity (global)",
    format: "json",
    key: "mcpServers",
    file: () =>
      path.join(os.homedir(), ".gemini", "config", "mcp_config.json"),
  },
  "amp-code": {
    label: "Amp Code",
    format: "json",
    key: "amp.mcpServers",
    file: () => path.join(os.homedir(), ".config", "amp", "settings.json"),
  },
};

/** Build a nested object from a dot-path key, e.g. "amp.mcpServers" → { amp: { mcpServers: ... } } */
function jsonSnippet(key) {
  const parts = key.split(".");
  let obj = { [MCP_NAME]: MCP_SERVER };
  for (let i = parts.length - 1; i >= 0; i--) obj = { [parts[i]]: obj };
  return JSON.stringify(obj, null, 2);
}

/** Read a dot-path from obj, creating intermediate objects as needed. Returns the leaf container + leaf key. */
function dotGet(obj, key) {
  const parts = key.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  return { container: cur, leaf: parts[parts.length - 1] };
}
function tomlSnippet() {
  return `[mcp_servers.${MCP_NAME}]\ncommand = "${MCP_SERVER.command}"\nargs = ${JSON.stringify(
    MCP_SERVER.args,
  )}`;
}

function printMcpSnippet(name, t, reason) {
  const key = t.key || "mcpServers";
  const body = t.format === "toml" ? tomlSnippet() : jsonSnippet(key);
  console.log(`\n${t.label} — add this MCP server manually:`);
  console.log(`  file: ${t.file()}`);
  if (reason) console.log(`  (${reason})`);
  console.log(
    body
      .split("\n")
      .map((l) => "    " + l)
      .join("\n"),
  );
}

function registerMcp(name, t) {
  // Print-only targets (TOML / unknown path): never edit, just show the snippet.
  if (t.format !== "json") {
    printMcpSnippet(name, t);
    return;
  }
  const file = t.file();
  const key = t.key;

  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      // JSONC comments (Cursor/VS Code allow them) make this unsafe to rewrite.
      printMcpSnippet(name, t, "existing config has comments — edit it by hand to avoid clobbering");
      return;
    }
    const { container: rc, leaf: rl } = dotGet(obj, key);
    rc[rl] = rc[rl] || {};
    if (rc[rl][MCP_NAME]) {
      console.log(`  ${t.label}: already registered → ${file}`);
      return;
    }
    rc[rl][MCP_NAME] = MCP_SERVER;
    fs.writeFileSync(file + ".bak", raw, "utf8");
    fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
    console.log(`✓ ${t.label}: added MCP server → ${file} (backup: ${path.basename(file)}.bak)`);
    return;
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, jsonSnippet(key) + "\n", "utf8");
  console.log(`✓ ${t.label}: created ${file} with the MCP server`);
}

function removeMcp(name, t) {
  if (t.format !== "json") {
    console.log(`  ${t.label}: remove the [${MCP_NAME}] entry from ${t.file()} by hand`);
    return;
  }
  const file = t.file();
  if (!fs.existsSync(file)) {
    console.log(`  ${t.label}: no config at ${file}`);
    return;
  }
  let obj;
  try {
    obj = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`  ${t.label}: config has comments — remove the "${MCP_NAME}" entry by hand`);
    return;
  }
  const key = t.key;
  const { container: dc, leaf: dl } = dotGet(obj, key);
  if (dc[dl] && dc[dl][MCP_NAME]) {
    delete dc[dl][MCP_NAME];
    fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
    console.log(`✓ ${t.label}: removed MCP server → ${file}`);
  } else {
    console.log(`  ${t.label}: not registered`);
  }
}

// ── CLI entry ──────────────────────────────────────────────────────────────

const [, , cmd, ...args] = process.argv;
const platformFlag = args.find((a) => !a.startsWith("--"));

if (cmd === "--version" || cmd === "-v") {
  console.log(PKG_VERSION);
  process.exit(0);
}

if (cmd === "serve" || cmd === "mcp-server") {
  await import("../mcp/server.js");
  await new Promise(() => { });
}

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
  console.log(`
proto-frames — install a low-fidelity wireframe skill into your AI agent

Usage:
  npx proto-frames install                auto-detect agents in this project
  npx proto-frames install <platform>     install the skill for one platform
  npx proto-frames uninstall [platform]   remove the skill (omit to auto-detect)
  npx proto-frames list                   show supported platforms

  npx proto-frames mcp <platform>         register the optional MCP server
  npx proto-frames mcp                     print MCP config for every harness
  npx proto-frames mcp --print <platform>  print (never edit) the MCP config
  npx proto-frames mcp --remove <platform> unregister the MCP server

The MCP server adds the live, no-paste feedback loop + the /editor direct-edit UI.
It is optional and only works on a local harness. The skill works without it.

Skill platforms: ${Object.keys(PLATFORMS).join(", ")}
MCP platforms:   ${Object.keys(MCP_TARGETS).join(", ")}
`);
  process.exit(0);
}

if (cmd === "list") {
  console.log("\nSupported platforms:\n");
  for (const [key, p] of Object.entries(PLATFORMS)) {
    console.log(`  ${key.padEnd(16)} ${p.label}`);
  }
  console.log();
  process.exit(0);
}

if (cmd === "install") {
  let targets;
  if (platformFlag) {
    if (!PLATFORMS[platformFlag]) {
      console.error(`Unknown platform: ${platformFlag}`);
      console.error(`Run: npx proto-frames list`);
      process.exit(1);
    }
    targets = [platformFlag];
  } else {
    targets = autoDetect();
    console.log(`Auto-detected: ${targets.join(", ")}\n`);
  }

  for (const t of targets) {
    writePlatform(t, PLATFORMS[t]);
    if (MCP_TARGETS[t]) registerMcp(t, MCP_TARGETS[t]);
  }
  console.log(
    "\nDone. Restart your agent to pick up the skill and MCP server." +
    "\nClaude Code may prompt to approve the new MCP server on next launch — accept it, or the wireframe tools won't be available.",
  );
  process.exit(0);
}

if (cmd === "uninstall") {
  // `uninstall mcp <platform>` → unregister the MCP server (skill left alone)
  if (args[0] === "mcp") {
    const plat = args.find((a) => !a.startsWith("--") && a !== "mcp");
    const list = plat ? [plat] : Object.keys(MCP_TARGETS);
    for (const t of list) {
      if (!MCP_TARGETS[t]) {
        console.error(`Unknown MCP platform: ${t}`);
        continue;
      }
      removeMcp(t, MCP_TARGETS[t]);
    }
    process.exit(0);
  }

  const targets = platformFlag ? [platformFlag] : autoDetect();

  if (!platformFlag) console.log(`Auto-detected: ${targets.join(", ")}\n`);

  for (const t of targets) {
    if (!PLATFORMS[t]) {
      console.error(`Unknown platform: ${t}`);
      continue;
    }
    removePlatform(t, PLATFORMS[t]);
    if (MCP_TARGETS[t]) {
      removeMcp(t, MCP_TARGETS[t]);
    }
  }
  process.exit(0);
}

if (cmd === "mcp") {
  const printOnly = args.includes("--print");
  const remove = args.includes("--remove");

  // No platform → safest default: print the config for every harness, edit nothing.
  if (!platformFlag) {
    console.log(
      "MCP launch command (same everywhere): npx -y proto-frames serve\n" +
      "Pass a platform to auto-merge JSON configs, e.g. `mcp cursor`.\n",
    );
    for (const [name, t] of Object.entries(MCP_TARGETS)) printMcpSnippet(name, t);
    process.exit(0);
  }

  const t = MCP_TARGETS[platformFlag];
  if (!t) {
    console.error(`Unknown MCP platform: ${platformFlag}`);
    console.error(`MCP platforms: ${Object.keys(MCP_TARGETS).join(", ")}`);
    process.exit(1);
  }
  if (remove) removeMcp(platformFlag, t);
  else if (printOnly) printMcpSnippet(platformFlag, t);
  else registerMcp(platformFlag, t);
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
console.error(`Run: npx proto-frames help`);
process.exit(1);
