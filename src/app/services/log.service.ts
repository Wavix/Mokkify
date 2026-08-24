import dayjs from "dayjs"
import { Op } from "sequelize"
import { v4 } from "uuid"

import { DB, findWithPaginate } from "../database"

import type { Method } from "../database/interfaces/endpoint.interface"
import type { LogAttributes, LogCreationAttributes } from "../database/interfaces/log.interface"
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

const FLUSH_INTERVAL_MS = 300
const FLUSH_BUFFER_SIZE = 500

// Logs are purged hourly; LOG_RETENTION_DAYS=0 disables the purge
const RETENTION_DAYS = process.env.LOG_RETENTION_DAYS === undefined ? 30 : Number(process.env.LOG_RETENTION_DAYS)
const RETENTION_SWEEP_INTERVAL_MS = 3_600_000

let retentionTimer: NodeJS.Timeout | null = null

const purgeExpiredLogs = async (): Promise<void> => {
  if (!RETENTION_DAYS) return

  try {
    await DB.models.Log.destroy({
      where: { created_at: { [Op.lt]: dayjs().subtract(RETENTION_DAYS, "day").toDate() } }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Log retention purge failed:", (error as Error).message)
  }
}

const startRetentionSweep = () => {
  if (retentionTimer || !RETENTION_DAYS) return

  retentionTimer = setInterval(() => purgeExpiredLogs(), RETENTION_SWEEP_INTERVAL_MS)
  retentionTimer.unref()
  void purgeExpiredLogs()
}

// Module-level so every LogService instance shares one write buffer
const buffer: Array<LogCreationAttributes> = []
let flushTimer: NodeJS.Timeout | null = null

const VERIFY_WAIT_TIMEOUT_MS = 3000
// correlation -> resolver, awaited by the verify route so it never scrapes the shared buffer
const correlationWaiters = new Map<string, (row: LogAttributes | null) => void>()

class LogService {
  public writeLog({ endpointId, request, response, body, relayResponse, templateName }: Log): void {
    startRetentionSweep()
    const ip = this.getIP(request)
    const url = new URL(request.url)
    const headers = this.getHeaders(request)

    buffer.push({
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
      method: request.method as Method,
      correlation: url.searchParams.get("mokkify_verify_id"),
      created_at: new Date()
    })

    if (buffer.length >= FLUSH_BUFFER_SIZE) {
      void this.flush()
      return
    }

    if (!flushTimer) {
      flushTimer = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS)
      flushTimer.unref()
    }
  }

  public awaitLog(correlation: string, timeoutMs = VERIFY_WAIT_TIMEOUT_MS): Promise<LogAttributes | null> {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        correlationWaiters.delete(correlation)
        resolve(null)
      }, timeoutMs)
      timer.unref()

      correlationWaiters.set(correlation, row => {
        clearTimeout(timer)
        correlationWaiters.delete(correlation)
        resolve(row)
      })
    })
  }

  private async flush(): Promise<void> {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    if (!buffer.length) return

    const rows = buffer.splice(0, buffer.length)
    try {
      await DB.models.Log.bulkCreate(rows)
      await this.resolveWaiters(rows)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Log flush failed:", (error as Error).message)
    }
  }

  private async resolveWaiters(rows: Array<LogCreationAttributes>): Promise<void> {
    if (!correlationWaiters.size) return

    const pending = [...new Set(rows.map(row => row.correlation).filter((c): c is string => !!c))].filter(c =>
      correlationWaiters.has(c)
    )

    for (const correlation of pending) {
      // bulkCreate does not reliably return ids on SQLite; re-read to hand the verify caller a row with its id
      const persisted = await DB.models.Log.findOne({ where: { correlation }, order: [["id", "DESC"]] })
      correlationWaiters.get(correlation)?.(persisted ? (persisted.toJSON() as LogAttributes) : null)
    }
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
        }),
        ...(filters.correlation && { correlation: filters.correlation })
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
