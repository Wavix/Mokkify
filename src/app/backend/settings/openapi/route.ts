import { NextResponse } from "next/server"

import { cache } from "@/app/cache"
import { OpenApiService } from "@/app/services"

const openApiService = new OpenApiService()

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as Blob | null
    if (!file) return NextResponse.json({ error: "Specification file is required" }, { status: 400 })

    const specContent = await file.text()

    const result = await openApiService.importSpec(specContent)
    await cache.clear()

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
