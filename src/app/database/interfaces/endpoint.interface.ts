import type { EndpointTemplateReferenceWithTemplate } from "./endpoint-template-reference.interface"
import type { RelayPayloadTemplateAttributes } from "./relay-payload-template.interface"
import type { ResponseTemplateAttributes } from "./response-template.interface"
import type { Model, ModelStatic, Optional, NonAttribute } from "sequelize"

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"

export interface EndpointAttributes {
  id: number
  uuid: string
  title: string
  path: string
  method: Method
  response_template_id: number | null
  is_multiple_templates: boolean
  max_pending_time: number | null
  relay_enabled: boolean
  relay_target: string | null // request field or url
  relay_method: Method
  relay_payload_template_id: number | null
  user_id: number
  created_at: Date
  response?: NonAttribute<ResponseTemplateAttributes>
  relay_payload?: NonAttribute<RelayPayloadTemplateAttributes>
  multiple_responses?: NonAttribute<Array<EndpointTemplateReferenceWithTemplate>>
}

// export interface EndpointWithResponse extends EndpointAttributes {
//   response: ResponseTemplateAttributes
//   relay_payload: RelayPayloadTemplateAttributes
//   multiple_responses: Array<EndpointTemplateReferenceWithTemplate>
// }

export interface EndpointCreationAttributes
  extends Optional<EndpointAttributes, "id" | "uuid" | "user_id" | "created_at"> {
  multiple_responses_templates?: Array<number>
}

export interface EndpointFormDataRequestBody {
  [key: string]: any
}

export interface EndpointInstance extends Model<EndpointAttributes, EndpointCreationAttributes>, EndpointAttributes {}

export interface EndpointModel extends ModelStatic<EndpointInstance> {}
