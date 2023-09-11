import { parseResponseBody } from "@/app/backend/helpers"

import type { Models } from "../interfaces"
import type { ResponseTemplateInstance, ResponseTemplateModel } from "../interfaces/response-template.interface"
import type Sequelize from "sequelize"

export const ResponseTemplate = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes
): ResponseTemplateModel => {
  const model: Sequelize.ModelStatic<ResponseTemplateInstance> = sequelize.define<ResponseTemplateInstance>(
    "response_templates",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      body_parsed: {
        type: DataTypes.VIRTUAL,
        get() {
          const body = this.getDataValue("body")
          const parsResponse = parseResponseBody(body)
          if (!parsResponse) return null

          try {
            return JSON.parse(parsResponse)
          } catch {
            return { error: "Template parsing error" }
          }
        }
      },
      code: {
        type: DataTypes.INTEGER,
        defaultValue: 200
      },
      user_id: {
        type: DataTypes.INTEGER
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      createdAt: "created_at",
      timestamps: false,
      underscored: true
    }
  )

  model.associate = (models: Models) => {
    model.hasMany(models.Endpoint, {
      sourceKey: "id",
      as: "endpoints",
      onDelete: "SET NULL"
    })

    model.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE"
    })
  }

  return model
}
