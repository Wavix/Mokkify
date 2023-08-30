import type { Models } from "../interfaces"
import type {
  RelayPayloadTemplateInstance,
  RelayPayloadTemplateModel
} from "../interfaces/relay-payload-template.interface"
import type Sequelize from "sequelize"

export const RelayPayloadTemplate = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes
): RelayPayloadTemplateModel => {
  const model: Sequelize.ModelStatic<RelayPayloadTemplateInstance> = sequelize.define<RelayPayloadTemplateInstance>(
    "relay_payload_templates",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      user_id: {
        type: DataTypes.INTEGER,
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
      underscored: true
    }
  )

  model.associate = (models: Models) => {
    model.hasMany(models.Endpoint, {
      sourceKey: "id",
      as: "endpoints",
      onDelete: "SET NULL"
    })
  }

  return model
}
