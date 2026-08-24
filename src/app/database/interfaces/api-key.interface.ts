import type { Model, ModelStatic, Optional } from "sequelize"

export interface ApiKeyAttributes {
  id: number
  key_id: string
  name: string
  secret_hash: string
  is_active: boolean
  last_used_at: Date | null
  created_at: Date
}

export interface ApiKeyCreationAttributes extends Optional<
  ApiKeyAttributes,
  "id" | "last_used_at" | "created_at" | "is_active"
> {}

export interface ApiKeyInstance extends Model<ApiKeyAttributes, ApiKeyCreationAttributes>, ApiKeyAttributes {}

export interface ApiKeyModel extends ModelStatic<ApiKeyInstance> {}
