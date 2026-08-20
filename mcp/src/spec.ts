import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { load } from "js-yaml"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenApiSpec = Record<string, any>

const LOCAL_SPEC_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "openapi.yaml")

async function fetchRemoteSpec(baseUrl: string): Promise<OpenApiSpec> {
  const response = await fetch(new URL("/openapi", baseUrl), { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error(`GET /openapi returned ${response.status}`)
  return (await response.json()) as OpenApiSpec
}

async function readLocalSpec(): Promise<OpenApiSpec> {
  const content = await readFile(LOCAL_SPEC_PATH, "utf8")
  return load(content) as unknown as OpenApiSpec
}

export async function loadSpec(baseUrl: string): Promise<OpenApiSpec> {
  try {
    const spec = await fetchRemoteSpec(baseUrl)
    console.error(`[mokkify-mcp] using OpenAPI spec source: remote: ${baseUrl}`)
    return spec
  } catch (error) {
    console.error(
      `[mokkify-mcp] could not fetch ${baseUrl}/openapi (${(error as Error).message}), falling back to local spec`
    )
    console.error(`[mokkify-mcp] using OpenAPI spec source: local fallback: ${LOCAL_SPEC_PATH}`)
    return readLocalSpec()
  }
}
