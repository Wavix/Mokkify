#!/usr/bin/env node
import { createRequire } from "node:module"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { load } from "js-yaml"

const ROOT = path.join(import.meta.dirname, "..")
const BACKEND_DIR = path.join(ROOT, "src", "app", "backend")
const SPEC_PATH = path.join(ROOT, "public", "openapi.yaml")
const NEXT_CONFIG_PATH = path.join(ROOT, "next.config.js")

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
const METHOD_EXPORT_PATTERN = new RegExp(`export\\s+(?:const|async function)\\s+(${HTTP_METHODS.join("|")})\\b`, "g")

const extractMethods = content => {
  const methods = new Set()
  for (const match of content.matchAll(METHOD_EXPORT_PATTERN)) methods.add(match[1])
  return methods
}

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

  const methodsByPath = new Map()
  for (const file of routeFiles) {
    const publicPath = rewriteMap.get(toBackendPath(file)) || toBackendPath(file)
    const content = await readFile(file, "utf8")
    const methods = methodsByPath.get(publicPath) || new Set()
    for (const method of extractMethods(content)) methods.add(method)
    methodsByPath.set(publicPath, methods)
  }

  const specContent = await readFile(SPEC_PATH, "utf8")
  const spec = load(specContent)
  const specPaths = spec.paths || {}

  const uncoveredPaths = [...methodsByPath.keys()].filter(backendPath => !specPaths[backendPath]).sort()

  const uncoveredMethods = []
  for (const [routePath, methods] of methodsByPath) {
    const specPathItem = specPaths[routePath]
    if (!specPathItem) continue
    for (const method of methods) {
      if (!specPathItem[method.toLowerCase()]) uncoveredMethods.push(`${routePath} ${method}`)
    }
  }
  uncoveredMethods.sort()

  if (uncoveredPaths.length || uncoveredMethods.length) {
    if (uncoveredPaths.length) {
      console.error("OpenAPI spec is missing the following /backend/* routes:")
      for (const uncoveredPath of uncoveredPaths) console.error(`  - ${uncoveredPath}`)
    }
    if (uncoveredMethods.length) {
      console.error("OpenAPI spec is missing the following path+method combinations:")
      for (const uncoveredMethod of uncoveredMethods) console.error(`  - ${uncoveredMethod}`)
    }
    process.exit(1)
  }

  const methodCount = [...methodsByPath.values()].reduce((count, methods) => count + methods.size, 0)
  console.log(
    `OpenAPI coverage OK: ${methodsByPath.size} /backend/* routes (${methodCount} methods) are all documented in openapi.yaml.`
  )
}

await main()
