import type { Model, ModelStatic, Optional } from "sequelize"

export interface RelayPayloadTemplateAttributes {
  id: number
  title: string
  body: string
  user_id: number
  created_at: Date
}

export interface RelayPayloadTemplateCreationAttributes
  extends Optional<RelayPayloadTemplateAttributes, "id" | "created_at" | "user_id"> {}

export interface RelayPayloadTemplateInstance
  extends Model<RelayPayloadTemplateAttributes, RelayPayloadTemplateCreationAttributes>,
    RelayPayloadTemplateAttributes {}

export interface RelayPayloadTemplateModel extends ModelStatic<RelayPayloadTemplateInstance> {}
