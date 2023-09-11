import type { Models } from "../interfaces"
import type {
  EndpointTemplateReferenceInstance,
  EndpointTemplateReferenceModel
} from "../interfaces/endpoint-template-reference.interface"
import type Sequelize from "sequelize"

export const EndpointTemplateReference = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes
): EndpointTemplateReferenceModel => {
  const model: Sequelize.ModelStatic<EndpointTemplateReferenceInstance> =
    sequelize.define<EndpointTemplateReferenceInstance>(
      "endpoint_template_references",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        endpoint_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        template_id: {
          type: DataTypes.INTEGER,
          allowNull: false
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
    model.hasOne(models.Endpoint, {
      foreignKey: "endpoint_id",
      as: "endpoints",
      onDelete: "CASCADE"
    })

    model.belongsTo(models.ResponseTemplate, {
      foreignKey: "template_id",
      as: "response",
      onDelete: "CASCADE"
    })
  }

  return model
}
