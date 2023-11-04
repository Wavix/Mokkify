import type { Model, ModelStatic, Optional } from "sequelize"

export interface ResponseTemplateAttributes {
  id: number
  title: string
  body: string
  body_parsed: unknown
  code: number
  user_id: number
  created_at: Date
}

export interface ResponseTemplateCreationAttributes
  extends Optional<ResponseTemplateAttributes, "id" | "user_id" | "created_at" | "body_parsed"> {}

export interface ResponseTemplateInstance
  extends Model<ResponseTemplateAttributes, ResponseTemplateCreationAttributes>,
    ResponseTemplateAttributes {}

export interface ResponseTemplateModel extends ModelStatic<ResponseTemplateInstance> {}
