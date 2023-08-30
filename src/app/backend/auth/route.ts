import { NextResponse } from "next/server"

import { UserService } from "../../services"
import { getBodyPayload } from "../helpers"

const userService = new UserService()

export const POST = async (request: Request) => await auth(request)

export const GET = async (request: Request) => await checkToken(request)

const auth = async (request: Request) => {
  try {
    const payload = await getBodyPayload(request)
    const { login, password } = payload

    const user = await userService.auth(login, password)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 })
  }
}

const checkToken = async (request: Request) => {
  const params = new URL(request.url).searchParams
  const token = params.get("token") || null
  if (!token) return NextResponse.json({ error: "Token is required" }, { status: 403 })

  try {
    const user = await userService.checkToken(token)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Token is invalid" }, { status: 403 })
  }
}
