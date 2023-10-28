import { NextResponse } from "next/server"

import { LogService, EndpointService } from "@/app/services"

const logService = new LogService()
const endpointService = new EndpointService()

export const DELETE = async (_: Request, query: NextQuery) => {
  const endpointId = Number(query.params.endpointId || 0)

  try {
    const endpoint = await endpointService.getEndpointById(endpointId)
    if (endpoint instanceof Error) return

    await logService.flushEndpointLogs(endpoint.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 })
  }
}
