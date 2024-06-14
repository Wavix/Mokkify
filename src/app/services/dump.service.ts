import { DB } from "../database"

import type { Models } from "@/app/database/interfaces"
import type { Model } from "sequelize"

class DumpService {
  private readonly models = [
    DB.models.ResponseTemplate,
    DB.models.RelayPayloadTemplate,
    DB.models.Endpoint,
    DB.models.EndpointTemplateReference
  ]
  private readonly delimiter = " ; "

  public async getDump(): Promise<string> {
    const result = []

    for (const model of this.models) {
      const response = await model.findAll<Model>({ raw: true })
      if (!response || !response.length) continue

      const headers = Object.keys(response[0]).join(this.delimiter)
      result.push(`TABLE: ${model.getTableName()}`)
      result.push(headers)

      for (const item of response) {
        const values = Object.values(item).join(this.delimiter)
        result.push(values)
      }

      result.push("")
    }

    return result.join("\n")
  }

  public async loadDump(dump: string): Promise<boolean | Error> {
    const lines = dump.split("\n")

    let currentTable: string | null = null
    let headers: Array<string> = []

    const transaction = await DB.sequelize.transaction()

    try {
      for (const line of lines) {
        if (line.startsWith("TABLE:")) {
          currentTable = line.replace("TABLE: ", "")
          headers = []

          const model = this.getModelByTableName(currentTable)
          if (model) await model.destroy<Model>({ where: {}, transaction })

          continue
        }

        if (currentTable && line === "") continue

        if (currentTable && headers.length === 0) {
          headers = line.split(this.delimiter)
          continue
        }

        if (currentTable && headers.length > 0) {
          const values = line.split(this.delimiter)
          const payload = headers.reduce((acc, header, index) => ({ ...acc, [header]: values[index] }), {})

          const model = this.getModelByTableName(currentTable)
          if (!model) return new Error(`Table ${currentTable} not found`)

          await model.create<Model>(this.formatPayload(payload), { transaction })
        }
      }

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      return new Error((error as Error).message)
    }
  }

  private getModelByTableName(tableName: string): Models[keyof Models] | null {
    const sequelizeModel = this.models.find(model => model.getTableName() === tableName)
    if (!sequelizeModel) return null

    return sequelizeModel
  }

  private formatPayload(payload: any): Record<string, unknown> {
    return Object.keys(payload).reduce((acc, key) => {
      let value = payload[key]

      if (key.includes("_id") || key.includes("Id")) {
        if (!value) value = null
      }

      return { ...acc, [key]: value }
    }, {})
  }
}

export { DumpService }
