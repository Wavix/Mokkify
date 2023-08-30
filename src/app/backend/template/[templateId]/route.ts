import { NextResponse } from "next/server"

import { getBodyPayload } from "../../helpers"
import { schema } from "../validation"

import { TemplateService } from "@/app/services"

const templateService = new TemplateService()

export const GET = async (_: Request, query: NextQuery) => {
  const templateId = Number(query.params.templateId || 0)
  if (templateId) return await getTemplateById(templateId)

  return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
}

export const DELETE = async (request: Request, query: NextQuery) => await deleteTemplate(request, query)
export const PUT = async (request: Request, query: NextQuery) => await updateTemplate(request, query)

const getTemplateById = async (templateId: number) => {
  try {
    const template = await templateService.getTemplateById(templateId)
    return NextResponse.json({ template })
  } catch (e) {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const updateTemplate = async (request: Request, query: NextQuery) => {
  const templateId = Number(query.params.templateId || 0)
  if (!templateId) return NextResponse.json({ error: "Template id must be a number" }, { status: 500 })

  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const template = await templateService.updateTemplate(templateId, payload)
    return NextResponse.json({ template })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

const deleteTemplate = async (_: Request, query: NextQuery) => {
  const templateId = Number(query.params.templateId || 0)
  if (!templateId) return NextResponse.json({ error: "Template id must be a number" }, { status: 500 })

  try {
    await templateService.deleteTemplate(templateId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
