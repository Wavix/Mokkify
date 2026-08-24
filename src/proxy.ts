import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

import { DB, dbConnect } from "@/app/database"
import { ApiKeyService } from "@/app/services"
import { config as appConfig } from "@/config"

const UNAUTHORIZED_PATHS = ["/backend/auth"]

export const config = {
  matcher: ["/backend/:path*", "/mcp"]
}

export const proxy = (request: Request) => {
  return backedAuth(request)
}

const backedAuth = async (request: Request) => {
  const url = new URL(request.url)
  const isGatedPath = url.pathname.startsWith("/backend/") || url.pathname === "/mcp"
  if (!isGatedPath) return NextResponse.next()
  if (UNAUTHORIZED_PATHS.includes(url.pathname)) return NextResponse.next()

  const authHeader = request.headers.get("Authorization") || ""
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : ""
  const jwtCandidate = bearer || url.searchParams.get("token") || ""

  try {
    await jwtVerify(jwtCandidate, new TextEncoder().encode(appConfig.jwtSecret))
    return NextResponse.next()
  } catch {
    // not a valid JWT — fall through to the API-key check
  }

  if (bearer) {
    try {
      if (!DB.connected) await dbConnect()
      if (await new ApiKeyService().verify(bearer)) return NextResponse.next()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API-key verification failed:", (error as Error).message)
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
