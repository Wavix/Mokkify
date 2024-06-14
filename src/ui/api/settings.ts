import { getAuthToken } from "./helpers"

export interface Settings {
  last_version: string
}

export const getSettings = async (): Promise<Settings> => {
  const response = await fetch("/backend/settings", { headers: { Authorization: getAuthToken() } })
  const data = await response.json()
  return data?.settings
}
