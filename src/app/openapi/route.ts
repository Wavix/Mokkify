import { readFile } from "node:fs/promises"
import path from "node:path"

import { load as loadYaml } from "js-yaml"
import { NextResponse } from "next/server"

const SPEC_PATH = path.join(process.cwd(), "public", "openapi.yaml")

export const GET = async () => {
  try {
    const specContent = await readFile(SPEC_PATH, "utf8")
    const spec = loadYaml(specContent)
    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
