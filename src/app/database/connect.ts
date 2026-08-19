/* eslint-disable no-console */
import { Sequelize, DataTypes } from "sequelize"

import * as Models from "./models"

import type { Db } from "./interfaces"

// Single pooled connection: pragmas below stay applied for the process
// lifetime, and SQLite allows only one writer anyway
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false,
  pool: { max: 1, idle: 3_600_000 }
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
    // WAL keeps readers unblocked by the log writer; NORMAL sync avoids a
    // full fsync per insert; busy_timeout prevents SQLITE_BUSY under load
    await DB.sequelize.query("PRAGMA journal_mode = WAL;")
    await DB.sequelize.query("PRAGMA synchronous = NORMAL;")
    await DB.sequelize.query("PRAGMA busy_timeout = 5000;")
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
