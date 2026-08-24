import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { NextResponse } from "next/server"

import { buildMcpServer } from "./server"

// Streamable HTTP in stateless mode: a fresh server/transport pair per POST and no
// session ids — the tools hold no state between calls, so any instance can answer.
export const POST = async (request: Request) => {
  try {
    const server = await buildMcpServer(request.headers.get("Authorization") || "")
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    })

    await server.connect(transport)
    return await transport.handleRequest(request)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// No server-push SSE stream and no sessions to terminate in stateless mode.
const methodNotAllowed = async () =>
  NextResponse.json({ error: "Use POST: this MCP endpoint is stateless" }, { status: 405, headers: { Allow: "POST" } })

export const GET = methodNotAllowed
export const DELETE = methodNotAllowed
