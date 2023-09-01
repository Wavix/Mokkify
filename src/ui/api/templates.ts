import { getAuthToken } from "./helpers"

import type {
  ResponseTemplateAttributes,
  ResponseTemplateCreationAttributes
} from "@/app/database/interfaces/response-template.interface"

export const getTemplatesList = async (): Promise<Array<ResponseTemplateAttributes> & ApiResponseError> => {
  const response = await fetch("/backend/template", { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data?.templates || []
}

export const getTemplateById = async (id: number): Promise<ResponseTemplateAttributes & ApiResponseError> => {
  const response = await fetch(`/backend/template/${id}`, { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data.template ? data.template : data
}

export const createTemplate = async (
  payload: Partial<ResponseTemplateCreationAttributes>
): Promise<ResponseTemplateAttributes & ApiResponseError> => {
  const response = await fetch("/backend/template", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "POST",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.template ? data.template : data
}

export const updateTemplate = async (
  id: number,
  payload: Partial<ResponseTemplateCreationAttributes>
): Promise<ResponseTemplateCreationAttributes & ApiResponseError> => {
  const response = await fetch(`/backend/template/${id}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "PUT",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.template ? data.template : data
}

export const deleteTemplate = async (id: number): Promise<ApiResponseBasic> => {
  const response = await fetch(`/backend/template/${id}`, {
    headers: { Authorization: getAuthToken() },
    method: "DELETE"
  })
  const data = await response.json()
  return data
}

export const duplicateTemplate = async (templateId: number): Promise<ApiResponseBasic & ApiResponseBasic> => {
  const response = await fetch(`/backend/template/${templateId}/duplicate`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "POST"
  })
  const data = await response.json()
  return data
}
