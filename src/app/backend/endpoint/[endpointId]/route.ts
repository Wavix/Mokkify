import { NextResponse } from "next/server"

import { getBodyPayload } from "../../helpers"
import { schema } from "../validation"

import { cache } from "@/app/cache"
import { EndpointService } from "@/app/services"

const endpointService = new EndpointService()

export const GET = async (_: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)
  if (endpointId) return await getEndpointById(endpointId)

  return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
}

export const DELETE = async (request: Request, query: NextQuery) => await deleteEndpoint(request, query)
export const PUT = async (request: Request, query: NextQuery) => await updateEndpoint(request, query)

const getEndpointById = async (endpointId: number) => {
  try {
    const endpoint = await endpointService.getEndpointById(endpointId)
    return NextResponse.json({ endpoint })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const updateEndpoint = async (request: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)
  if (!endpointId) return NextResponse.json({ error: "Endpoint id must be a number" }, { status: 500 })

  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const endpoint = await endpointService.updateEndpoint(endpointId, payload)
    if (endpoint instanceof Error) throw Error("Endpoint doesn't update")

    await cache.delete(endpointId)

    return NextResponse.json({ endpoint })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

const deleteEndpoint = async (request: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)
  if (!endpointId) return NextResponse.json({ error: "Endpoint id must be a number" }, { status: 500 })

  try {
    const endpoint = await endpointService.getEndpointById(endpointId)
    if (endpoint instanceof Error) throw Error("Endpoint not found")

    const success = await endpointService.deleteEndpoint(endpointId)

    await cache.delete(endpointId)

    return NextResponse.json({ success })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
