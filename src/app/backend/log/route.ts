import { NextResponse } from "next/server"

import { getPaginationQuery } from "../../database/helpers"
import { EndpointService, LogService } from "../../services"

const endpointService = new EndpointService()
const logService = new LogService()

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const endpointId = Number(url.pathname.split("/")[3] || 0)
  if (!endpointId) return NextResponse.json({ error: "Endpoint id must be a number" }, { status: 500 })

  try {
    const endpoint = await endpointService.getEndpointById(endpointId)
    if (endpoint instanceof Error) return

    const pagination = getPaginationQuery(request)
    const response = await logService.getEndpointLogs(endpoint.id, pagination)

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
