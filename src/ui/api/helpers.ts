import { config } from "@/config"

const paginationInitial: Pagination = {
  current_page: 1,
  limit: config.perPageDefaults[0],
  total: 0,
  total_pages: 1
}

export const listInitial = { items: [], pagination: paginationInitial }

export const buildQueryString = (obj: { [key: string]: any }) => {
  const keyValuePairs = Object.entries(obj).map(
    ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  )
  return `?${keyValuePairs.join("&")}`
}

export const getAuthToken = (): string => {
  const token = localStorage.getItem("auth_jwt")
  return token ? `Bearer ${token}` : ""
}
