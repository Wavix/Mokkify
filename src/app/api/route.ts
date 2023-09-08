import { NextResponse } from "next/server"

import { DB, dbConnect } from "../database"
import { EndpointService, LogService, RelayService } from "../services"

import { parseResponseBody } from "@/app/backend/helpers"

import type { RelayResponse, ApiResponse } from "../services"
import type { EndpointWithResponse, EndpointFormDataRequestBody } from "@/app/database/interfaces/endpoint.interface"

interface LogWithRelay {
  endpoint: EndpointWithResponse
  request: Request
  requestBody: unknown
  apiResponse: ApiResponse
}

const endpointService = new EndpointService()
const logService = new LogService()
const relayService = new RelayService()

export const GET = async (request: Request) => await response(request)

export const POST = async (request: Request) => await response(request)

export const PUT = async (request: Request) => await response(request)

export const PATCH = async (request: Request) => await response(request)

export const DELETE = async (request: Request) => await response(request)

const response = async (request: Request) => {
  if (!DB.connected) await dbConnect()

  const url = new URL(request.url)
  const endpointPath = url.pathname.split("/api/")[1]
  const requestBody = await getBody(request)
  const queryParams = getQueryParams(url)
  const requestBodyWithQueryParams = { ...requestBody, ...queryParams }

  try {
    const result: ApiResponse = {
      status: 200,
      templateName: null,
      body: { success: true }
    }

    const endpoint = await endpointService.getEndpoint(endpointPath, request.method)
    if (endpoint instanceof Error) return notFound()

    if (endpoint.max_pending_time) {
      const pendingTime = randomInteger(0, endpoint.max_pending_time * 1000)
      await new Promise(resolve => setTimeout(resolve, pendingTime))
    }

    if (endpoint.response_template_id && !endpoint.is_multiple_templates) {
      result.status = endpoint.response.code
      result.body = getJsonResponse(endpoint.response.body, requestBodyWithQueryParams)
      result.templateName = endpoint.response.title
    }

    if (endpoint.is_multiple_templates && endpoint.multiple_responses.length) {
      const randomIndex = randomInteger(0, endpoint.multiple_responses.length - 1)
      const randomResponse = endpoint.multiple_responses[randomIndex]
      result.status = randomResponse.response.code
      result.body = getJsonResponse(randomResponse.response.body, requestBodyWithQueryParams)
      result.templateName = randomResponse.response.title
    }

    logWithRelay({ endpoint, request, requestBody, apiResponse: result })

    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(url.pathname, (error as Error).message)
    return notFound()
  }
}

const relay = async (
  requestBody: unknown,
  apiResponse: ApiResponse,
  endpoint: EndpointWithResponse
): Promise<RelayResponse | null> => {
  if (!endpoint.relay_enabled || !endpoint.relay_target?.trim()) return null

  try {
    const relayResponse = await relayService.relay(requestBody, apiResponse, endpoint)
    if (relayResponse instanceof Error) return null

    return relayResponse
  } catch {
    return null
  }
}

const logWithRelay = async ({ endpoint, request, requestBody, apiResponse }: LogWithRelay) => {
  const relayResponse = await relay(requestBody, apiResponse, endpoint)
  logService.writeLog({
    endpointId: endpoint.id,
    templateName: apiResponse.templateName,
    response: apiResponse,
    body: requestBody,
    relayResponse,
    request
  })
}

const randomInteger = (min: number, max: number): number => {
  return Math.floor(min + Math.random() * (max + 1 - min))
}

const notFound = () => {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

const getBody = async (request: Request): Promise<Record<string, any> | null> => {
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("form-data")) return await parsedFormData(request)

  try {
    return await request.json()
  } catch {
    return null
  }
}

const getQueryParams = (url: URL): Record<string, any> => {
  const params: Record<string, any> = {}
  const queryParams = Object.fromEntries(url.searchParams)

  Object.keys(queryParams).forEach(key => {
    let value: number | string | boolean = queryParams[key]

    const isNumber = /^\d+$/.test(value)

    if (isNumber) value = Number(value)
    if (value === "true" || value === "false") value = value === "true"

    params[key] = value
  })

  return params
}

const parsedFormData = async (request: Request): Promise<Record<string, any>> => {
  const formData = await request.formData()
  const data: EndpointFormDataRequestBody = {}

  for (const [key, value] of formData.entries()) {
    data[key] = value
  }

  return data
}

const getJsonResponse = (responseBody: string, requestBody: unknown): unknown => {
  const json = parseResponseBody(responseBody, requestBody)
  if (!json) return null

  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
