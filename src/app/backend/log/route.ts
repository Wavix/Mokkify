import { NextResponse } from "next/server"

import { getPaginationQuery } from "../../database/helpers"
import { EndpointService, LogService } from "../../services"

const endpointService = new EndpointService()
const logService = new LogService()

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isUuid = (value: string | null): boolean => !!value && UUID_PATTERN.test(value)

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const endpointId = Number(url.pathname.split("/")[3] || 0)
  if (!endpointId) return NextResponse.json({ error: "Endpoint id must be a number" }, { status: 500 })

  try {
    const endpoint = await endpointService.getEndpointById(endpointId)
    if (endpoint instanceof Error) return

    const pagination = getPaginationQuery(request)
    const filters: Partial<LogListFilters> = {
      ...(url.searchParams.get("from") && { from: url.searchParams.get("from") || "" }),
      ...(url.searchParams.get("to") && { to: url.searchParams.get("to") || "" }),
      ...(url.searchParams.get("template") && { template: url.searchParams.get("template") || "" }),
      ...(url.searchParams.get("host") && { host: url.searchParams.get("host") || "" }),
      ...(url.searchParams.get("code") && { code: Number(url.searchParams.get("code")) }),
      ...(isUuid(url.searchParams.get("correlation")) && { correlation: url.searchParams.get("correlation") || "" })
    }
    const response = await logService.getEndpointLogs(endpoint.id, pagination, filters)

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
