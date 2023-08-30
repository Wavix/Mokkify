import { NextResponse } from "next/server"

import { TemplateService } from "@/app/services"

const templateService = new TemplateService()

export const POST = async (_: Request, query: NextQuery) => await duplicateTemplate(Number(query.params.templateId))

const duplicateTemplate = async (templateId: number) => {
  try {
    await templateService.duplicateTemplate(templateId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
