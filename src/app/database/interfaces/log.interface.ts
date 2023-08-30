import type { Method } from "./endpoint.interface"
import type { Model, ModelStatic, Optional } from "sequelize"

export interface LogAttributes {
  id: number
  uuid: string
  endpoint_id: number
  url: string
  pathname: string
  method: Method
  user_agent: string | null
  search: string
  request_payload: any
  response_payload: any
  template_name: string | null
  relay_url: string
  relay_method: Method
  relay_request_body: any
  relay_response_body: any
  relay_response_code: number
  request_headers: Record<string, string>
  response_code: number
  request_ip: string
  created_at: Date
}

export interface LogCreationAttributes extends Optional<LogAttributes, "id" | "created_at"> {}

export interface LogInstance extends Model<LogAttributes, LogCreationAttributes>, LogAttributes {}

export interface LogModel extends ModelStatic<LogInstance> {}
