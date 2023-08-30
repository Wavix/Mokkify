import type {
  RelayPayloadTemplateAttributes,
  RelayPayloadTemplateCreationAttributes
} from "@/app/database/interfaces/relay-payload-template.interface"

export const getRelaysList = async (): Promise<Array<RelayPayloadTemplateAttributes> & ApiResponseError> => {
  const response = await fetch("/backend/relay")
  const data = await response.json()
  return data?.relays || []
}

export const getRelayTemplateById = async (id: number): Promise<RelayPayloadTemplateAttributes & ApiResponseError> => {
  const response = await fetch(`/backend/relay/${id}`)
  const data = await response.json()
  return data.relay ? data.relay : data
}

export const createRelayTemplate = async (
  payload: Partial<RelayPayloadTemplateCreationAttributes>
): Promise<RelayPayloadTemplateCreationAttributes & ApiResponseError> => {
  const response = await fetch("/backend/relay", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.relay ? data.relay : data
}

export const updateRelayTemplate = async (
  id: number,
  payload: Partial<RelayPayloadTemplateCreationAttributes>
): Promise<RelayPayloadTemplateAttributes & ApiResponseError> => {
  const response = await fetch(`/backend/relay/${id}`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    method: "PUT",
    body: JSON.stringify(payload)
  })
  const data = await response.json()
  return data.relay ? data.relay : data
}

export const deleteRelayTemplate = async (id: number): Promise<ApiResponseBasic> => {
  const response = await fetch(`/backend/relay/${id}`, {
    method: "DELETE"
  })
  const data = await response.json()
  return data
}

export const duplicateRelayTemplate = async (RelayTemplateId: number): Promise<ApiResponseBasic & ApiResponseBasic> => {
  const response = await fetch(`/backend/relay/${RelayTemplateId}/duplicate`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  })
  const data = await response.json()
  return data
}
