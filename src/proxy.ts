import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

import { DB, dbConnect } from "@/app/database"
import { ApiKeyService } from "@/app/services"
import { config as appConfig } from "@/config"

const UNAUTHORIZED_PATHS = ["/backend/auth"]

export const config = {
  matcher: "/backend/:path*"
}

export const proxy = (request: Request) => {
  return backedAuth(request)
}

const backedAuth = async (request: Request) => {
  const url = new URL(request.url)
  if (!url.pathname.startsWith("/backend/")) return NextResponse.next()
  if (UNAUTHORIZED_PATHS.includes(url.pathname)) return NextResponse.next()

  const token = request.headers.get("Authorization") || url.searchParams.get("token") || ""
  const presented = token.split(" ").pop() || ""

  try {
    await jwtVerify(presented, new TextEncoder().encode(appConfig.jwtSecret))
    return NextResponse.next()
  } catch {
    // not a valid JWT — fall through to API-key check
  }

  if (!DB.connected) await dbConnect()
  if (await new ApiKeyService().verify(presented)) return NextResponse.next()

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
