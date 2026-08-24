import { NextResponse } from "next/server"

import { loadLocalSpec } from "./spec"

export const GET = async () => {
  try {
    const spec = await loadLocalSpec()
    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
