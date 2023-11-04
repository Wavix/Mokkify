import type { ResponseTemplateAttributes } from "./response-template.interface"
import type { Model, ModelStatic, Optional } from "sequelize"

export interface EndpointTemplateReferenceAttributes {
  id: number
  endpoint_id: number
  template_id: number
  created_at: Date
}

export interface EndpointTemplateReferenceWithTemplate extends EndpointTemplateReferenceAttributes {
  response: ResponseTemplateAttributes
}

export interface MultipleTemplateResponse {
  templates: Array<number>
}

export interface EndpointTemplateReferenceCreationAttributes
  extends Optional<EndpointTemplateReferenceAttributes, "id" | "created_at"> {}

export interface EndpointTemplateReferenceInstance
  extends Model<EndpointTemplateReferenceAttributes, EndpointTemplateReferenceCreationAttributes>,
    EndpointTemplateReferenceAttributes {}

export interface EndpointTemplateReferenceModel extends ModelStatic<EndpointTemplateReferenceInstance> {}
