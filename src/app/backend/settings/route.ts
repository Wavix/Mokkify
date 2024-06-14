import { NextResponse } from "next/server"

import { SettingsService } from "@/app/services"

const settingsService = new SettingsService()

export const GET = async () => {
  try {
    const lastVersion = await settingsService.getLastVersion()

    return NextResponse.json({ settings: { last_version: lastVersion } })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
