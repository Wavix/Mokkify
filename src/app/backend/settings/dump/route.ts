import { NextResponse } from "next/server"

import { DumpService } from "@/app/services"

const dumpService = new DumpService()

export const GET = async () => {
  try {
    const dump = await dumpService.getDump()

    return new Response(dump, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=dump-${new Date().toISOString()}.csv`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as Blob
    const dumpContent = await file.text()

    const response = await dumpService.loadDump(dumpContent)
    if (response instanceof Error) return NextResponse.json({ error: response.message }, { status: 500 })

    return NextResponse.json({ message: "Dump created" })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
