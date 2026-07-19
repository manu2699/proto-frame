#!/usr/bin/env node
/**
 * proto-frames MCP server — entry point.
 *
 * Serves wireframe previews from in-memory models over localhost.
 * No files are written to the user's project.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, handleTool } from "./tools.js";
import { info } from "./log.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")).version;

const server = new Server(
  { name: "proto-frames", version: PKG_VERSION },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const meta = req.params._meta;
  info("mcp", `tool call: ${name}`, { feature: args.feature });
  return handleTool(name, args, { server, meta });
});

const transport = new StdioServerTransport();
info("mcp", `server starting v${PKG_VERSION}`);
await server.connect(transport);
info("mcp", "stdio transport connected");
