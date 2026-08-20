import { NextResponse } from "next/server"
import { v4 } from "uuid"

import { getBodyPayload } from "@/app/backend/helpers"
import { EndpointService, LogService } from "@/app/services"

import type { EndpointAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { LogAttributes } from "@/app/database/interfaces/log.interface"

const endpointService = new EndpointService()
const logService = new LogService()

const LOG_POLL_ATTEMPTS = 4
const LOG_POLL_DELAY_MS = 120

interface VerifyRequestBody {
  method?: string
  query?: Record<string, string>
  body?: unknown
  headers?: Record<string, string>
}

export const POST = async (request: Request, query: NextQuery) => await verifyMock(request, query)

const verifyMock = async (request: Request, query: NextQuery) => {
  const endpointId = Number((await query.params).endpointId || 0)
  if (!endpointId) return NextResponse.json({ error: "Endpoint id must be a number" }, { status: 500 })

  let endpoint: EndpointAttributes
  try {
    const resolved = await endpointService.getEndpointById(endpointId)
    if (resolved instanceof Error) throw resolved
    endpoint = resolved
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 })
  }

  try {
    const payload: VerifyRequestBody = (await getBodyPayload(request)) || {}
    const correlation = v4().toString()
    const mockUrl = buildMockUrl(request, endpoint.path, payload.query, correlation)

    const res = await fetch(mockUrl, {
      method: payload.method || endpoint.method,
      headers: payload.headers,
      ...(payload.body !== undefined && { body: JSON.stringify(payload.body) })
    })
    const responseBody = await res.text()
    const responseHeaders = getResponseHeaders(res)

    await logService.flush()
    const log = await pollCorrelatedLog(endpoint.id, correlation)

    return NextResponse.json({
      response: { status: res.status, body: responseBody, headers: responseHeaders },
      log: log ?? { pending: true }
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

const buildMockUrl = (
  request: Request,
  path: string,
  query: Record<string, string> | undefined,
  correlation: string
): string => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  const mockUrl = new URL(`/api/${normalizedPath}`, new URL(request.url).origin)

  Object.entries(query || {}).forEach(([key, value]) => mockUrl.searchParams.set(key, value))
  mockUrl.searchParams.set("mokkify_verify_id", correlation)

  return mockUrl.toString()
}

const getResponseHeaders = (response: Response): Record<string, string> => {
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })
  return headers
}

// Poll window must exceed LogService's 300ms flush interval: the mock request's log
// write is fire-and-forget, so it can land in the buffer after our explicit flush()
// already ran, and only the periodic flush timer will persist it.
const pollCorrelatedLog = async (endpointId: number, correlation: string): Promise<LogAttributes | null> => {
  for (let attempt = 0; attempt < LOG_POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, LOG_POLL_DELAY_MS))

    const { items } = await logService.getEndpointLogs(endpointId, { page: 1, limit: 1 }, { correlation })
    if (items[0]) return items[0]
  }

  return null
}
