import Sequelize from "sequelize"

import type { LogInstance, LogModel } from "../interfaces/log.interface"

export const Log = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes): LogModel => {
  const model: Sequelize.ModelStatic<LogInstance> = sequelize.define<LogInstance>(
    "logs",
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
      url: {
        type: DataTypes.TEXT
      },
      pathname: {
        type: DataTypes.TEXT
      },
      search: {
        type: DataTypes.TEXT
      },
      method: {
        type: DataTypes.STRING
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      template_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      request_payload: {
        type: DataTypes.JSON
      },
      response_payload: {
        type: DataTypes.JSON
      },
      response_code: {
        type: DataTypes.INTEGER
      },
      request_headers: {
        type: DataTypes.JSON
      },
      request_ip: {
        type: DataTypes.STRING,
        allowNull: true
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: true
      },
      relay_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      relay_method: {
        type: DataTypes.STRING,
        allowNull: true
      },
      relay_request_body: {
        type: DataTypes.JSON,
        allowNull: true
      },
      relay_response_body: {
        type: DataTypes.JSON,
        allowNull: true
      },
      relay_response_code: {
        type: DataTypes.NUMBER,
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
          fields: ["endpoint_id"],
          using: "BTREE"
        }
      ]
    }
  )

  return model
}
