import { NextResponse } from "next/server"

import { cache } from "../../cache"
import { MockService } from "../../services"
import { getBodyPayload } from "../helpers"

import { schema } from "./validation"

const mockService = new MockService()

export const POST = async (request: Request) => await createMock(request)

const createMock = async (request: Request) => {
  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const endpoint = await mockService.createMock(payload)
    await cache.clear()
    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error("Failed to create mock:", error)
    return NextResponse.json({ error: "Failed to create mock" }, { status: 400 })
  }
}
