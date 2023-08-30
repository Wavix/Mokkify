import { NextResponse } from "next/server"

import { LogService } from "@/app/services"

const logService = new LogService()

export const GET = async (_: Request, query: NextQuery) => {
  const logId = Number(query.params.logId || 0)
  if (logId) return await getLogById(logId)

  return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
}

const getLogById = async (logId: number) => {
  try {
    const log = await logService.getLogById(logId)
    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}
