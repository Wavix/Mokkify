import { NextResponse } from "next/server"

import { TemplateService } from "../../services"
import { getBodyPayload } from "../helpers"

import { schema } from "./validation"

const templateService = new TemplateService()

export const GET = async () => await getList()

export const POST = async (request: Request) => await createTemplate(request)

const getList = async () => {
  try {
    const templates = await templateService.getTemplatesList()
    return NextResponse.json({ templates })
  } catch {
    return NextResponse.json({ error: "Error while executing request" }, { status: 500 })
  }
}

const createTemplate = async (request: Request) => {
  const payload = await getBodyPayload(request)
  if (!payload) return NextResponse.json({ error: "Payload is required" }, { status: 500 })

  const result = schema.validate(payload)
  if (result.error?.message)
    return NextResponse.json({ error: result.error.message.replaceAll('"', "'") }, { status: 400 })

  try {
    const template = await templateService.createTemplate({ ...payload, user_id: 1 })
    return NextResponse.json({ template })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
