import dayjs from "dayjs"
import { Op } from "sequelize"
import { v4 } from "uuid"

import { DB, findWithPaginate } from "../database"

import type { Method } from "../database/interfaces/endpoint.interface"
import type { LogAttributes } from "../database/interfaces/log.interface"
import type { RelayResponse } from "@/app/services"

export interface ApiResponse {
  status: number
  body: unknown
  templateName: null | string
}

interface Log {
  endpointId: number
  request: Request
  body: unknown
  templateName: string | null
  response: ApiResponse
  relayResponse: RelayResponse | null
}

class LogService {
  public async writeLog({ endpointId, request, response, body, relayResponse, templateName }: Log): Promise<void> {
    const ip = this.getIP(request)
    const url = new URL(request.url)
    const headers = this.getHeaders(request)

    await DB.models.Log.create({
      uuid: v4().toString(),
      endpoint_id: endpointId,
      request_payload: body,
      response_payload: response.body,
      response_code: response.status,
      request_ip: ip,
      request_headers: headers,
      template_name: templateName,
      relay_url: relayResponse?.url || null,
      relay_method: relayResponse?.method || null,
      relay_request_body: relayResponse?.requestBody || null,
      relay_response_body: relayResponse?.responseBody || null,
      relay_response_code: relayResponse?.code || null,
      url: this.getRealUrl(request),
      pathname: url.pathname,
      search: url.search,
      user_agent: request.headers.get("user-agent") || null,
      method: request.method as Method
    })
  }

  public async getEndpointLogs(
    endpointId: number,
    pagination: PaginationProps,
    filters: Partial<LogListFilters>
  ): Promise<ListResponse<LogAttributes>> {
    const isDateFilter = filters.from && filters.to
    const isOneDayFilter = isDateFilter && dayjs(filters.from).format() === dayjs(filters.to).format()

    const respones = await findWithPaginate<LogAttributes>(DB.models.Log, {
      ...pagination,
      where: {
        endpoint_id: endpointId,
        ...(filters.host && { request_ip: filters.host }),
        ...(filters.code && { response_code: filters.code }),
        ...(isDateFilter &&
          !isOneDayFilter && {
            created_at: { [Op.between]: [dayjs(filters.from).format(), dayjs(filters.to).format()] }
          }),
        ...(isOneDayFilter && {
          created_at: { [Op.between]: [dayjs(filters.from).format(), dayjs(filters.to).add(1, "day").format()] }
        }),
        ...(filters.template && {
          template_name: {
            [Op.like]: `%${filters.template}%`
          }
        })
      },
      order: [["id", "DESC"]]
    })
    return respones
  }

  public async getLogById(logId: number): Promise<LogAttributes | null> {
    const response = await DB.models.Log.findByPk(logId)
    return response
  }

  public async flushEndpointLogs(endpointId: number): Promise<void> {
    await DB.models.Log.destroy({
      where: {
        endpoint_id: endpointId
      }
    })
  }

  private getRealUrl(request: Request): string {
    const host = request.headers.get("host") || ""
    const url = new URL(request.url)

    if (host && host !== "localhost") return `${url.protocol}//${host}${url.pathname}${url.search}`

    return url.href
  }

  private getIP(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")
    return forwarded ? forwarded.split(/, /)[0] : "127.0.0.1"
  }

  private getHeaders = (request: Request): Record<string, string> => {
    const result: Record<string, string> = {}

    request.headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}

export { LogService }
