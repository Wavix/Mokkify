import { useRouter } from "next/router"

import { config } from "@/config"

export const usePagination = () => {
  const { query } = useRouter()
  const page = query.page ? parseInt(query.page as string, 10) : 1
  const limit = query.limit ? parseInt(query.limit as string, 10) : config.perPageDefaults[0]
  return { page, limit }
}
