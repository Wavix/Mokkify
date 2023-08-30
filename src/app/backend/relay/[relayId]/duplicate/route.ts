import { NextResponse } from "next/server"

import { RelayService } from "@/app/services"

const relayService = new RelayService()

export const POST = async (_: Request, query: NextQuery) => await duplicateTemplate(Number(query.params.relayId))

const duplicateTemplate = async (relayTemplateId: number) => {
  try {
    await relayService.duplicateRelayTemplate(relayTemplateId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
