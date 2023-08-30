import type { Models } from "../database/models"
import type Sequelize from "sequelize"

declare module "sequelize" {
  export type ModelStatic<M extends Model> = NonConstructor<typeof Model> & { new (): M } & {
    associate?: (reg: Models) => void
  } & { decrement?: any }

  export interface FindAndCountOptions extends Sequelize.FindAndCountOptions {
    page?: number
  }
}

declare global {
  export interface NextQuery {
    params: { [key: string]: string | Array<string> }
  }

  export interface ApiResponseError {
    error: string
  }

  export interface ApiResponseBasic {
    success: boolean
  }

  export interface Pagination {
    limit: number
    total: number
    current_page: number
    total_pages: number
  }

  export interface ListResponse<T = any> {
    pagination: Pagination
    items: Array<T>
  }

  export interface PaginationProps {
    page: number
    limit: number
  }

  export interface ListQueryParams<T = {}> extends T, PaginationProps {}
}
