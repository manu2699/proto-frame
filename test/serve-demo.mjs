// Boots the MCP server, opens a demo wireframe with an in-memory model,
// prints the URL, and stays alive so a browser can verify rendering + SSE/POST feedback.
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const DEMO_MODEL = {
  feature: "Demo Dashboard",
  change: "Example wireframe for manual testing",
  designSource: "guess: generic primitives",
  screens: [
    {
      id: "s_overview", name: "Overview",
      states: [{ id: "default", name: "Default", nodes: [
        { type: "row", children: [
          { type: "nav", side: "left", groups: [
            { label: "Main", items: [
              { text: "Overview", active: true, goto: "s_overview" },
              { text: "Settings", goto: "s_settings" },
            ]},
          ]},
          { type: "col", children: [
            { type: "grid", cols: 3, children: [
              { type: "box", kind: "kpi", label: "Total users" },
              { type: "box", kind: "kpi", label: "Revenue" },
              { type: "box", kind: "kpi", label: "Conversion" },
            ]},
            { type: "box", kind: "chart:bars", mods: ["tall"], label: "Monthly trends" },
          ]},
        ]},
      ]}],
    },
    {
      id: "s_filters", name: "Filters",
      states: [{ id: "default", name: "Default", nodes: [
        { type: "col", children: [
          { type: "box", kind: "select", label: "Region: All" },
          { type: "box", kind: "select", label: "Status: Active" },
          { type: "box", kind: "select", label: "Period: Last 30 days" },
        ]},
      ]}],
    },
    {
      id: "s_reports", name: "Reports",
      states: [{ id: "default", name: "Default", nodes: [
        { type: "box", kind: "table", label: "Monthly Report", headers: ["Month", "Revenue", "Users"], rows: [["Jan", "12k", "800"], ["Feb", "15k", "950"]] },
      ]}],
    },
    {
      id: "s_settings", name: "Settings",
      states: [{ id: "default", name: "Default", nodes: [
        { type: "box", kind: "form", label: "Preferences", backend: "PUT /settings" },
        { type: "box", kind: "button", label: "Save", action: "submit" },
      ]}],
    },
  ],
};

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(root, "mcp", "server.js")],
  env: { ...process.env, WF_NO_OPEN: "1", WF_PORT: process.env.WF_PORT || "5199" },
});
const client = new Client({ name: "demo", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

const open = await client.callTool({
  name: "wireframe_open",
  arguments: { feature: "Demo Dashboard", model: DEMO_MODEL },
});
console.log("URL:", open.content[0].text.match(/http:\/\/[^\s]+/)[0]);
setInterval(() => {}, 1 << 30);
