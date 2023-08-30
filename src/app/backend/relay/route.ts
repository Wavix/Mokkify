import { NextResponse } from "next/server"

import { RelayService } from "../../services"
import { getBodyPayload } from "../helpers"

import { schema } from "./validation"

const relayService = new RelayService()

export const GET = async () => await getList()

export const POST = async (request: Request) => await createRelay(request)

const getList = async () => {
  try {
    const relays = await relayService.getRelaysList()
    return NextResponse.json({ relays })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const createRelay = async (request: Request) => {
  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const relay = await relayService.createRelayTemplate({ ...payload, user_id: 1 })
    return NextResponse.json({ relay })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
