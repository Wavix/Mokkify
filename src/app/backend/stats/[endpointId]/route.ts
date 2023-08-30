import { NextResponse } from "next/server"

import { StatsService } from "@/app/services"

const statsService = new StatsService()

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const endpointId = Number(url.pathname.split("/")[3] || 0)
  const days = Number(url.searchParams.get("days")) || 1

  try {
    const rps = await statsService.getEndpointRps(endpointId, days)
    return NextResponse.json({ rps })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
