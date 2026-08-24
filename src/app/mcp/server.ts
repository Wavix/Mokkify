import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { loadLocalSpec } from "@/app/openapi/spec"

import { buildUrl, callOperation } from "@mcp/client"
import { buildInputShape, extractOperations } from "@mcp/openapi"

import type { ToolCallResult } from "@mcp/client"
import type { OpenApiOperation } from "@mcp/openapi"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenApiSpec = Record<string, any>

const SERVER_NAME = "mokkify-mcp"
const DEFAULT_UPLOAD_NAME = "upload.txt"

// The self-call target is fixed to loopback, never derived from the request Host
// header: a spoofable forwarded host would otherwise turn this into an SSRF vector.
const selfOrigin = (): string => process.env.MOKKIFY_SELF_ORIGIN || `http://127.0.0.1:${process.env.PORT || 3000}`

interface SpecTools {
  spec: OpenApiSpec
  operations: Array<OpenApiOperation>
}

let cachedTools: SpecTools | undefined

const loadTools = async (): Promise<SpecTools> => {
  if (!cachedTools) {
    const spec = (await loadLocalSpec()) as OpenApiSpec
    cachedTools = { spec, operations: extractOperations(spec) }
  }
  return cachedTools
}

const isMultipart = (operation: OpenApiOperation): boolean =>
  Boolean(operation.requestBody && !operation.requestBody.content["application/json"])

// The stdio server reads uploads from the agent's local disk; an HTTP caller has no
// shared filesystem with the app, so multipart operations take the content inline.
const buildHttpInputShape = (operation: OpenApiOperation, spec: OpenApiSpec): Record<string, z.ZodTypeAny> => {
  const shape = { ...buildInputShape(operation, spec) }
  if (!isMultipart(operation)) return shape

  delete shape.file_path
  shape.file_content = z.string().describe("Raw content of the file to upload")
  shape.file_name = z.string().optional().describe(`Upload filename (defaults to ${DEFAULT_UPLOAD_NAME})`)
  return shape
}

const callMultipartOperation = async (
  token: string,
  operation: OpenApiOperation,
  args: Record<string, unknown>
): Promise<ToolCallResult> => {
  const url = buildUrl(selfOrigin(), operation, args)

  const fileName = typeof args.file_name === "string" && args.file_name ? args.file_name : DEFAULT_UPLOAD_NAME
  const form = new FormData()
  form.set("file", new Blob([String(args.file_content ?? "")]), fileName)

  const response = await fetch(url, {
    method: operation.method.toUpperCase(),
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })

  return { status: response.status, ok: response.ok, body: await response.text() }
}

// Mirrors mcp/src/index.ts (stdio): the same spec-generated tool set, one tool per
// /backend/* operation — only the transport and the upload input differ.
export const buildMcpServer = async (authorization: string): Promise<McpServer> => {
  const { spec, operations } = await loadTools()
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : ""

  const server = new McpServer({ name: SERVER_NAME, version: process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0" })

  for (const operation of operations) {
    server.registerTool(
      operation.operationId,
      {
        title: operation.summary,
        description: operation.description ?? operation.summary,
        inputSchema: buildHttpInputShape(operation, spec)
      },
      async args => {
        const toolArgs = args as Record<string, unknown>
        const result = isMultipart(operation)
          ? await callMultipartOperation(token, operation, toolArgs)
          : await callOperation({ baseUrl: selfOrigin(), apiKey: token }, operation, toolArgs)

        return {
          isError: !result.ok,
          content: [{ type: "text", text: result.body || `${result.status} (empty body)` }]
        }
      }
    )
  }

  return server
}
