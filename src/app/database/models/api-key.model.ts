import type { ApiKeyInstance, ApiKeyModel } from "../interfaces/api-key.interface"
import type Sequelize from "sequelize"

export const ApiKey = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes): ApiKeyModel => {
  const model: Sequelize.ModelStatic<ApiKeyInstance> = sequelize.define<ApiKeyInstance>(
    "api_keys",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      key_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      secret_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      createdAt: "created_at",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          fields: ["key_id"],
          unique: true
        }
      ]
    }
  )

  return model
}
