import { getAuthToken } from "./helpers"

import type { ApiKeyCreated, ApiKeyPublicAttributes } from "@/app/services/api-key.service"

export const getApiKeysList = async (): Promise<Array<ApiKeyPublicAttributes> & ApiResponseError> => {
  const response = await fetch("/backend/api-key", { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data?.keys || []
}

export const createApiKey = async (name: string): Promise<ApiKeyCreated & ApiResponseError> => {
  const response = await fetch("/backend/api-key", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "POST",
    body: JSON.stringify({ name })
  })
  const data = await response.json()
  return data
}

export const revokeApiKey = async (id: number): Promise<ApiResponseBasic> => {
  const response = await fetch(`/backend/api-key/${id}`, {
    headers: { Authorization: getAuthToken() },
    method: "DELETE"
  })
  const data = await response.json()
  return data
}

export const toggleApiKey = async (id: number, isActive: boolean): Promise<ApiResponseBasic> => {
  const response = await fetch(`/backend/api-key/${id}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive })
  })
  const data = await response.json()
  return data
}
