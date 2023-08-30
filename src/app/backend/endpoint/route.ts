import { NextResponse } from "next/server"

import { EndpointService } from "../../services"
import { getBodyPayload } from "../helpers"

import { schema } from "./validation"

const endpointService = new EndpointService()

export const GET = async () => await getList()
export const POST = async (request: Request) => await createEndpoint(request)

const getList = async () => {
  try {
    const endpoints = await endpointService.getEndpointsList()
    return NextResponse.json({ endpoints })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const createEndpoint = async (request: Request) => {
  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const endpoint = await endpointService.createEndpoint(payload)
    return NextResponse.json({ endpoint })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
