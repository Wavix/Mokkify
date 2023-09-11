import { Umzug, SequelizeStorage } from "umzug"

import { DB } from "./connect"

export type Migration = typeof migrator._types.migration

export const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.ts", { cwd: __dirname }]
  },
  context: DB.sequelize,
  storage: new SequelizeStorage({
    sequelize: DB.sequelize,
    modelName: "sequelize_meta"
  }),
  logger: console
})

const main = async () => {
  await migrator.runAsCLI()
  process.exit()
}

main()
