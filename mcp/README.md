# mokkify-mcp

A thin stdio MCP server for [Mokkify](../README.md). It has no hand-written
tools: at startup it fetches Mokkify's OpenAPI contract and registers one MCP
tool per `/backend/*` operation, named after the operation's `operationId`.
Each tool call is proxied straight to the corresponding Mokkify endpoint.

Regenerating a tool set for a new Mokkify version means nothing more than
restarting this server against that version — the spec is the only source
of truth (see `docs/implementations/feature_agent-integration/design.md`,
DD-003 and DD-007).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MOKKIFY_BASE_URL` | yes | Base URL of a running Mokkify instance, e.g. `http://localhost:3000`. Used both to fetch `GET /openapi` and as the target for every tool call. |
| `MOKKIFY_API_KEY` | yes | An API key created via `POST /backend/api-key` (Settings → API Keys in the UI), sent as `Authorization: Bearer <key>` on every call. |

If `GET ${MOKKIFY_BASE_URL}/openapi` is unreachable at startup, the server
falls back to the spec bundled at `../public/openapi.yaml` in this repo so
tools can still be generated and inspected offline; actual tool calls still
require a reachable `MOKKIFY_BASE_URL`.

## Build and run

```bash
cd mcp
pnpm install
pnpm build
MOKKIFY_BASE_URL=http://localhost:3000 MOKKIFY_API_KEY=<key_id>.<secret> pnpm start
```

## Registering with an MCP client

Same pattern as `wavix-mcp-server`: point the client at the built entry
point over stdio.

```jsonc
// Claude Desktop / Claude Code MCP config
{
  "mcpServers": {
    "mokkify": {
      "command": "node",
      "args": ["/absolute/path/to/mokkify/mcp/dist/index.js"],
      "env": {
        "MOKKIFY_BASE_URL": "http://localhost:3000",
        "MOKKIFY_API_KEY": "<key_id>.<secret>"
      }
    }
  }
}
```

## Example: create a mock, then verify it

An agent connected to this server would typically call two generated
tools in sequence:

1. **`createMock`** (`POST /backend/mock`) — builds the response template
   and endpoint atomically:

   ```jsonc
   {
     "body": {
       "title": "DLR webhook",
       "path": "dlr",
       "method": "POST",
       "response": {
         "code": 200,
         "content_type": "application/json",
         "body": "{\"ok\":true}"
       }
     }
   }
   ```

   Returns `{ "endpoint": { "id": 42, ... } }`.

2. **`verifyMock`** (`POST /backend/mock/{endpointId}/verify`) — fires the
   mock and returns its synchronous response plus the correlated log row:

   ```jsonc
   { "endpointId": 42, "body": { "method": "POST" } }
   ```

   Returns `{ "response": { "status": 200, "body": "{\"ok\":true}", ... }, "log": { ... } }`.
