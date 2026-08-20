import { NextResponse } from "next/server"

import { ApiKeyService } from "../../services"
import { getBodyPayload } from "../helpers"

import { schema } from "./validation"

const apiKeyService = new ApiKeyService()

export const GET = async () => await getList()
export const POST = async (request: Request) => await createKey(request)

const getList = async () => {
  try {
    const keys = await apiKeyService.list()
    return NextResponse.json({ keys })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const createKey = async (request: Request) => {
  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const created = await apiKeyService.createKey(payload.name)
    return NextResponse.json({ key: created.key, plaintext: created.plaintext })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
