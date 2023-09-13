import { getAuthToken } from "./helpers"

export interface RPSItem {
  date: string
  requests: number
  rps: number
}

export interface RPSResponse {
  rps: Array<RPSItem>
}

export const getEndpointRps = async (endpointId: number): Promise<RPSResponse> => {
  const response = await fetch(`/backend/stats/${endpointId}`, {
    headers: {
      Authorization: getAuthToken()
    }
  })
  const data = await response.json()
  return data
}
