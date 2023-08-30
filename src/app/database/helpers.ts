import type { ModelStatic, FindAndCountOptions } from "sequelize"

const LIST_LIMIT_MIN = 25
const LIST_LIMIT_MAX = 100

export const findWithPaginate = async <T = any>(
  model: ModelStatic<any>,
  options: FindAndCountOptions
): Promise<ListResponse<T>> => {
  const page = options.page ? Number(options.page) : 1
  const limit = options.limit ? Math.min(options.limit, LIST_LIMIT_MAX) : LIST_LIMIT_MIN

  const findOptions = {
    ...options,
    limit,
    offset: (page - 1) * limit
  }

  const pagination = await getPagination(model, findOptions)

  const items = pagination.items ? pagination.items.map((item: any) => item.toJSON() as T) : []

  return {
    pagination: {
      limit,
      total: pagination.total,
      current_page: page,
      total_pages: Math.floor((pagination.total + (limit - 1)) / limit)
    },
    items
  }
}

export const getPaginationQuery = (request: Request): PaginationProps => {
  const url = new URL(request.url)
  return {
    page: Number(url.searchParams.get("page")) || 1,
    limit: Number(url.searchParams.get("limit")) || LIST_LIMIT_MIN
  }
}

const getPagination = async (model: ModelStatic<any>, options: FindAndCountOptions) => {
  const response = await model.findAndCountAll(options)

  if (!response.count) return { total: 0, items: response.rows }

  const total = typeof response.count === "number" ? response.count : (response.count as Array<any>).length

  return {
    total,
    items: response.rows
  }
}
