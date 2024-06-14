import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

import { config } from "@/config"

const UNAUTHORIZED_PATHS = ["/backend/auth"]

export const middleware = (request: Request) => {
  return backedAuth(request)
}

const backedAuth = async (request: Request) => {
  const url = new URL(request.url)
  if (!url.pathname.startsWith("/backend/")) return NextResponse.next()
  if (UNAUTHORIZED_PATHS.includes(url.pathname)) return NextResponse.next()

  const token = request.headers.get("Authorization") || url.searchParams.get("token") || ""
  try {
    const jwtArray = token.split(" ")
    const jwtToken = jwtArray[jwtArray.length - 1]

    await jwtVerify(jwtToken, new TextEncoder().encode(config.jwtSecret))
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
