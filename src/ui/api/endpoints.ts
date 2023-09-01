import { buildQueryString, getAuthToken } from "./helpers"

import type { MultipleTemplateResponse } from "@/app/database/interfaces/endpoint-template-reference.interface"
import type { EndpointWithResponse, EndpointCreationAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { LogAttributes } from "@/app/database/interfaces/log.interface"

export const getEndpointsList = async (): Promise<Array<EndpointWithResponse>> => {
  const response = await fetch("/backend/endpoint", {
    headers: {
      Authorization: getAuthToken()
    }
  })
  const data = await response.json()
  return data?.endpoints || []
}

export const getEndpointLogs = async (
  endpointId: number,
  params: ListQueryParams
): Promise<ListResponse<LogAttributes>> => {
  const response = await fetch(`/backend/endpoint/${endpointId}/logs${buildQueryString(params)}`, {
    headers: {
      Authorization: getAuthToken()
    }
  })
  const data = await response.json()
  return data
}

export const getLogById = async (id: number): Promise<LogAttributes> => {
  const response = await fetch(`/backend/log/${id}`, { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data?.log
}

export const getEndpointById = async (id: number): Promise<EndpointWithResponse & ApiResponseError> => {
  const response = await fetch(`/backend/endpoint/${id}`, { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data.endpoint ? data.endpoint : data
}

export const createEndpoint = async (
  payload: Partial<EndpointCreationAttributes>
): Promise<EndpointWithResponse & ApiResponseError> => {
  const response = await fetch("/backend/endpoint", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "POST",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.endpoint ? data.endpoint : data
}

export const updateEndpoint = async (
  id: number,
  payload: Partial<EndpointCreationAttributes>
): Promise<EndpointWithResponse & ApiResponseError> => {
  const response = await fetch(`/backend/endpoint/${id}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "PUT",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.endpoint ? data.endpoint : data
}

export const deleteEndpoint = async (id: number): Promise<ApiResponseBasic> => {
  const response = await fetch(`/backend/endpoint/${id}`, {
    headers: { Authorization: getAuthToken() },
    method: "DELETE"
  })
  const data = await response.json()
  return data
}

export const getEndpointMultipleTemplates = async (endpointId: number): Promise<MultipleTemplateResponse> => {
  const response = await fetch(`/backend/endpoint/${endpointId}/multiple-templates`, {
    headers: { Authorization: getAuthToken() }
  })
  const data = await response.json()
  return data
}

export const updateEndpointMultipleTemplates = async (
  endpointId: number,
  templateIds: Array<number>
): Promise<MultipleTemplateResponse> => {
  const response = await fetch(`/backend/endpoint/${endpointId}/multiple-templates`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": getAuthToken()
    },
    method: "POST",
    body: JSON.stringify({ templates: templateIds })
  })
  const data = await response.json()
  return data
}
