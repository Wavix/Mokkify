import { NextResponse } from "next/server"

import { getBodyPayload } from "../../helpers"

import { ApiKeyService } from "@/app/services"

const apiKeyService = new ApiKeyService()

export const DELETE = async (_: Request, query: NextQuery) => await revokeKey(query)
export const PATCH = async (request: Request, query: NextQuery) => await toggleKey(request, query)

const revokeKey = async (query: NextQuery) => {
  const keyId = Number((await query.params).keyId || 0)
  if (!keyId) return NextResponse.json({ error: "Key id must be a number" }, { status: 500 })

  try {
    await apiKeyService.revoke(keyId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

const toggleKey = async (request: Request, query: NextQuery) => {
  const keyId = Number((await query.params).keyId || 0)
  if (!keyId) return NextResponse.json({ error: "Key id must be a number" }, { status: 500 })

  const payload = await getBodyPayload(request)
  if (!payload || typeof payload.is_active !== "boolean")
    return NextResponse.json({ error: "is_active must be a boolean" }, { status: 400 })

  try {
    await apiKeyService.setActive(keyId, payload.is_active)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
