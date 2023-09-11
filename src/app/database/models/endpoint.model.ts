import Sequelize from "sequelize"

import type { Models } from "../interfaces"
import type { EndpointInstance, EndpointModel } from "../interfaces/endpoint.interface"

export const Endpoint = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes): EndpointModel => {
  const model: Sequelize.ModelStatic<EndpointInstance> = sequelize.define<EndpointInstance>(
    "endpoints",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      path: {
        type: DataTypes.STRING
      },
      method: {
        type: DataTypes.STRING,
        defaultValue: "GET"
      },
      response_template_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      is_multiple_templates: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      max_pending_time: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: true
      },
      relay_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      relay_target: {
        type: DataTypes.STRING,
        allowNull: true
      },
      relay_method: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      },
      relay_payload_template_id: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true
      },
      user_id: {
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
      underscored: true,
      timestamps: false,
      indexes: [
        {
          fields: ["path", "method"],
          unique: true,
          using: "BTREE"
        }
      ]
    }
  )

  model.associate = (models: Models) => {
    model.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE"
    })

    model.hasMany(models.Log, {
      sourceKey: "id",
      foreignKey: "endpoint_id",
      as: "requests"
    })

    model.hasMany(models.EndpointTemplateReference, {
      sourceKey: "id",
      foreignKey: "endpoint_id",
      as: "multiple_responses"
    })

    model.belongsTo(models.ResponseTemplate, {
      foreignKey: "response_template_id",
      as: "response",
      onDelete: "SET NULL"
    })

    model.belongsTo(models.RelayPayloadTemplate, {
      foreignKey: "relay_payload_template_id",
      as: "relay_payload",
      onDelete: "SET NULL"
    })
  }

  return model
}
