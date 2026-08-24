import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { callOperation } from "./client.js"
import { buildInputShape, extractOperations } from "./openapi.js"
import { loadSpec } from "./spec.js"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`[mokkify-mcp] missing required env var ${name}`)
    process.exit(1)
  }
  return value
}

async function main() {
  const baseUrl = requireEnv("MOKKIFY_BASE_URL")
  const apiKey = requireEnv("MOKKIFY_API_KEY")

  const spec = await loadSpec(baseUrl)
  const operations = extractOperations(spec)

  const server = new McpServer({ name: "mokkify-mcp", version: "1.0.0" })

  for (const operation of operations) {
    server.registerTool(
      operation.operationId,
      {
        title: operation.summary,
        description: operation.description ?? operation.summary,
        inputSchema: buildInputShape(operation, spec)
      },
      async args => {
        const result = await callOperation({ baseUrl, apiKey }, operation, args as Record<string, unknown>)
        return {
          isError: !result.ok,
          content: [{ type: "text", text: result.body || `${result.status} (empty body)` }]
        }
      }
    )
  }

  console.error(`[mokkify-mcp] registered ${operations.length} tools from ${baseUrl}/openapi`)

  await server.connect(new StdioServerTransport())
}

main().catch(error => {
  console.error("[mokkify-mcp] fatal error", error)
  process.exit(1)
})
