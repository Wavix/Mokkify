import { NextResponse } from "next/server"

import { getBodyPayload } from "@/app/backend/helpers"
import { RandomTemplates } from "@/app/services"

const randomTemplates = new RandomTemplates()

export const POST = async (request: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)
  const payload = await getBodyPayload(request)

  try {
    await randomTemplates.updateEndpointTemplates(endpointId, payload.templates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export const GET = async (_: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)
  if (!endpointId) return NextResponse.json({ templates: [] })

  const templates = await randomTemplates.getEndpointTemplates(endpointId)
  return NextResponse.json({ templates })
}
