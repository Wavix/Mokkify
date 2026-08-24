import { readFile } from "node:fs/promises"
import path from "node:path"

import { load as loadYaml } from "js-yaml"

const SPEC_PATH = path.join(process.cwd(), "public", "openapi.yaml")

let cachedSpec: unknown

export const loadLocalSpec = async (): Promise<unknown> => {
  if (cachedSpec === undefined) {
    const specContent = await readFile(SPEC_PATH, "utf8")
    cachedSpec = loadYaml(specContent)
  }
  return cachedSpec
}
