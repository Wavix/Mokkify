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
