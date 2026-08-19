import { NextResponse } from "next/server"

import { DB, dbConnect } from "../database"

export const GET = async () => {
  try {
    if (!DB.connected) await dbConnect()
    await DB.sequelize.query("SELECT 1")

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    return NextResponse.json({ status: "error", error: (error as Error).message }, { status: 503 })
  }
}
