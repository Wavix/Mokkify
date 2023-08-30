import { NextResponse } from "next/server"

import { getBodyPayload } from "../../helpers"
import { schema } from "../validation"

import { RelayService } from "@/app/services"

const relayService = new RelayService()

export const GET = async (_: Request, query: NextQuery) => {
  const relayTemplateId = Number(query.params.relayId || 0)
  if (relayTemplateId) return await getRelayTemplateById(relayTemplateId)

  return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
}

export const DELETE = async (request: Request, query: NextQuery) => await deleteRelayTemplate(request, query)
export const PUT = async (request: Request, query: NextQuery) => await updateRelayTemplate(request, query)

const getRelayTemplateById = async (relayTemplateId: number) => {
  try {
    const relay = await relayService.getRelayTemplateById(relayTemplateId)
    return NextResponse.json({ relay })
  } catch (e) {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const updateRelayTemplate = async (request: Request, query: NextQuery) => {
  const relayTemplateId = Number(query.params.relayId || 0)
  if (!relayTemplateId) return NextResponse.json({ error: "Relay template id must be a number" }, { status: 500 })

  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const relay = await relayService.updateRelayTemplate(relayTemplateId, payload)
    return NextResponse.json({ relay })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

const deleteRelayTemplate = async (_: Request, query: NextQuery) => {
  const relayTemplateId = Number(query.params.relayId || 0)
  if (!relayTemplateId) return NextResponse.json({ error: "Relay template id must be a number" }, { status: 500 })

  try {
    await relayService.deleteRelayTemplate(relayTemplateId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
