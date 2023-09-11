/* eslint-disable no-console */
import { Sequelize, DataTypes } from "sequelize"

import * as Models from "./models"

import type { Db } from "./interfaces"

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false
})

const DB: Db = {
  sequelize,
  connected: false,
  models: {
    User: Models.User(sequelize, DataTypes),
    Endpoint: Models.Endpoint(sequelize, DataTypes),
    Log: Models.Log(sequelize, DataTypes),
    ResponseTemplate: Models.ResponseTemplate(sequelize, DataTypes),
    RelayPayloadTemplate: Models.RelayPayloadTemplate(sequelize, DataTypes),
    EndpointTemplateReference: Models.EndpointTemplateReference(sequelize, DataTypes)
  }
}

Object.keys(DB.models).forEach(item => {
  // @ts-ignore
  if (DB.models[item].associate) {
    // @ts-ignore
    DB.models[item].associate(DB.models)
  }
})

export const dbConnect = async () => {
  try {
    await DB.sequelize.sync({ alter: { drop: false } })
    console.log("Database connected")
  } catch (err) {
    console.log("ERROR", err)
  }
  DB.connected = true
}

export const dbCreate = async () => {
  await DB.sequelize.sync({ force: true })
  console.log("Database created")
}

export { DB }
