import { readFile, realpath } from "node:fs/promises"
import path from "node:path"

import type { OpenApiOperation } from "./openapi.js"

export interface MokkifyClientConfig {
  baseUrl: string
  apiKey: string
}

export interface ToolCallResult {
  status: number
  ok: boolean
  body: string
}

function buildUrl(baseUrl: string, operation: OpenApiOperation, args: Record<string, unknown>): URL {
  let resolvedPath = operation.path
  for (const param of operation.parameters) {
    if (param.in !== "path") continue
    resolvedPath = resolvedPath.replace(`{${param.name}}`, encodeURIComponent(String(args[param.name])))
  }

  const url = new URL(resolvedPath, baseUrl)
  for (const param of operation.parameters) {
    if (param.in !== "query") continue
    const value = args[param.name]
    if (value !== undefined) url.searchParams.set(param.name, String(value))
  }

  return url
}

async function resolveUploadPath(filePath: string): Promise<string> {
  const baseDir = path.resolve(process.env.MOKKIFY_UPLOAD_DIR || process.cwd())
  const resolved = path.resolve(baseDir, filePath)
  const real = await realpath(resolved)
  const isInBaseDir = real === baseDir || real.startsWith(`${baseDir}${path.sep}`)
  if (!isInBaseDir) throw new Error(`file_path must resolve within ${baseDir}`)
  return real
}

async function buildBody(
  operation: OpenApiOperation,
  args: Record<string, unknown>
): Promise<{ body?: string | FormData; headers: Record<string, string> }> {
  const requestBody = operation.requestBody
  if (!requestBody) return { headers: {} }

  const mediaType = requestBody.content["application/json"] ? "application/json" : Object.keys(requestBody.content)[0]

  if (mediaType === "application/json") {
    if (args.body === undefined) return { headers: {} }
    return { body: JSON.stringify(args.body), headers: { "Content-Type": "application/json" } }
  }

  if (mediaType === "multipart/form-data") {
    const filePath = args.file_path
    if (typeof filePath !== "string") return { headers: {} }
    const resolvedPath = await resolveUploadPath(filePath)
    const buffer = await readFile(resolvedPath)
    const form = new FormData()
    form.set("file", new Blob([new Uint8Array(buffer)]), path.basename(resolvedPath))
    return { body: form, headers: {} }
  }

  return { headers: {} }
}

export async function callOperation(
  config: MokkifyClientConfig,
  operation: OpenApiOperation,
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const url = buildUrl(config.baseUrl, operation, args)
  const { body, headers } = await buildBody(operation, args)

  const response = await fetch(url, {
    method: operation.method.toUpperCase(),
    headers: { Authorization: `Bearer ${config.apiKey}`, ...headers },
    body
  })

  return { status: response.status, ok: response.ok, body: await response.text() }
}
