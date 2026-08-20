#!/usr/bin/env node
import { createRequire } from "node:module"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { load } from "js-yaml"

const ROOT = path.join(import.meta.dirname, "..")
const BACKEND_DIR = path.join(ROOT, "src", "app", "backend")
const SPEC_PATH = path.join(ROOT, "public", "openapi.yaml")
const NEXT_CONFIG_PATH = path.join(ROOT, "next.config.js")

const findRouteFiles = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async entry => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return findRouteFiles(entryPath)
      return entry.name === "route.ts" ? [entryPath] : []
    })
  )
  return files.flat()
}

const toBackendPath = routeFile => {
  const relative = path
    .relative(BACKEND_DIR, routeFile)
    .replace(/route\.ts$/, "")
    .replace(/\/$/, "")
  const segments = relative
    .split(path.sep)
    .filter(Boolean)
    .map(segment => segment.replace(/^\[(.+)\]$/, "{$1}"))
  return `/backend${segments.length ? `/${segments.join("/")}` : ""}`
}

// next.config.js rewrites (e.g. /backend/endpoint/:endpointId/logs -> /backend/log) make a
// route file reachable only under a different public path; resolve those before comparing.
const buildRewriteMap = async () => {
  const require = createRequire(import.meta.url)
  const nextConfig = require(NEXT_CONFIG_PATH)
  const rewrites = (await nextConfig.rewrites?.()) || []

  const map = new Map()
  for (const rewrite of rewrites) {
    if (!rewrite.destination.startsWith("/backend")) continue
    const publicPath = rewrite.source.replace(/:([a-zA-Z0-9_]+)/g, "{$1}")
    map.set(rewrite.destination, publicPath)
  }
  return map
}

const main = async () => {
  const routeFiles = await findRouteFiles(BACKEND_DIR)
  const rewriteMap = await buildRewriteMap()
  const backendPaths = new Set(routeFiles.map(file => rewriteMap.get(toBackendPath(file)) || toBackendPath(file)))

  const specContent = await readFile(SPEC_PATH, "utf8")
  const spec = load(specContent)
  const specPaths = new Set(Object.keys(spec.paths || {}))

  const uncovered = [...backendPaths].filter(backendPath => !specPaths.has(backendPath)).sort()

  if (uncovered.length) {
    console.error("OpenAPI spec is missing the following /backend/* routes:")
    for (const uncoveredPath of uncovered) console.error(`  - ${uncoveredPath}`)
    process.exit(1)
  }

  console.log(`OpenAPI coverage OK: ${backendPaths.size} /backend/* routes are all documented in openapi.yaml.`)
}

await main()
