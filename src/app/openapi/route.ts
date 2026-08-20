import { readFile } from "node:fs/promises"
import path from "node:path"

import { load as loadYaml } from "js-yaml"
import { NextResponse } from "next/server"

const SPEC_PATH = path.join(process.cwd(), "public", "openapi.yaml")

let cachedSpec: unknown

const loadSpec = async () => {
  if (cachedSpec === undefined) {
    const specContent = await readFile(SPEC_PATH, "utf8")
    cachedSpec = loadYaml(specContent)
  }
  return cachedSpec
}

export const GET = async () => {
  try {
    const spec = await loadSpec()
    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
