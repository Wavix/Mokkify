import type { Model, ModelStatic, Optional } from "sequelize"

export interface UserAttributes {
  id: number
  login: string
  password: string
  created_at: Date
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "created_at"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export interface UserModel extends ModelStatic<UserInstance> {}
