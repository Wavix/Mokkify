import { NextResponse } from "next/server"

import { cache } from "@/app/cache"
import { EndpointService } from "@/app/services"

const endpointService = new EndpointService()

export const POST = async (_: Request, query: NextQuery) =>
  await duplicateEndpoint(Number((await query.params).endpointId))

const duplicateEndpoint = async (endpointId: number) => {
  try {
    const endpoint = await endpointService.duplicateEndpoint(endpointId)
    await cache.clear()
    return NextResponse.json({ endpoint, success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
