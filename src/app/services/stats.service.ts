import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { QueryTypes } from "sequelize"

import { DB } from "../database"

interface EndpointStatsItem {
  date: string
  requests: number
  rps: number
}

type EndpointStats = Omit<EndpointStatsItem, "date">

dayjs.extend(utc)

class StatsService {
  public async getEndpointRps(endpointId: number, days = 7): Promise<Array<EndpointStatsItem> | Error> {
    const dbStats = new Map<String, EndpointStats>()
    const result: Array<EndpointStatsItem> = []

    const now = dayjs()
    const startOfDay = now.subtract(days - 1, "days").startOf("day")
    const diffInMinutes = now.diff(startOfDay, "minute")

    const dateFrom = now.subtract(days, "day").format("YYYY-MM-DD HH:mm:ss")
    const query = `SELECT
    date,
    requests,
    ROUND(MAX(requests * 1.0), 2) AS rps
      FROM (
        SELECT
        strftime('%Y-%m-%d %H:%M:%S', created_at, 'localtime') AS date,
        COUNT(*) AS requests
        FROM logs
        WHERE endpoint_id = ${endpointId} AND created_at >= '${dateFrom}'
        GROUP BY strftime('%Y-%m-%d %H:%M:%S', created_at)
      ) AS grouped_requests
    GROUP BY date`

    try {
      const response: Array<EndpointStatsItem> = await DB.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      for (const item of response) {
        dbStats.set(item.date, { rps: item.rps, requests: item.requests })
      }

      for (let min = diffInMinutes; min >= 0; min -= 1) {
        const date = now.subtract(min, "second").format("YYYY-MM-DD HH:mm:ss")
        result.push({
          date,
          rps: dbStats.has(date) ? Number(dbStats.get(date)?.rps) : 0,
          requests: dbStats.has(date) ? Number(dbStats.get(date)?.requests) : 0
        })
      }

      return result
    } catch {
      throw new Error("Error while getting stats")
    }
  }
}

export { StatsService }
