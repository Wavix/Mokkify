import { DB } from "../database"

import type {
  ResponseTemplateAttributes,
  ResponseTemplateCreationAttributes
} from "../database/interfaces/response-template.interface"
import type { Model } from "sequelize"

class TemplateService {
  public async getTemplateById(id: number): Promise<ResponseTemplateAttributes | Error> {
    const response = await DB.models.ResponseTemplate.findByPk(id)
    if (!response || !response.id) throw new Error("Template not found")

    return response.toJSON()
  }

  public async getTemplatesList(): Promise<Array<ResponseTemplateAttributes> | Error> {
    const response = await DB.models.ResponseTemplate.findAll({
      order: [["id", "DESC"]]
    })

    if (!response) throw new Error("Templates request error")
    return response.map((item: Model<ResponseTemplateAttributes>) => item.toJSON())
  }

  public async createTemplate(
    payload: ResponseTemplateCreationAttributes
  ): Promise<ResponseTemplateAttributes | Error> {
    const response = await DB.models.ResponseTemplate.create(payload)
    if (!response) throw new Error("Error while creating template")
    return response.toJSON()
  }

  public async updateTemplate(
    templateId: number,
    payload: ResponseTemplateCreationAttributes
  ): Promise<ResponseTemplateAttributes | Error> {
    const template = await DB.models.ResponseTemplate.findByPk(templateId)
    if (!template?.id) throw new Error("Template not found")

    const response = await template.update(payload)
    return response.toJSON()
  }

  public async deleteTemplate(id: number): Promise<boolean | Error> {
    const exists = await DB.models.ResponseTemplate.findByPk(id)
    if (!exists?.id) throw new Error("Template not found")

    try {
      await DB.models.ResponseTemplate.destroy({ where: { id } })
      // cache.clear()

      return true
    } catch {
      return false
    }
  }

  public async duplicateTemplate(templateId: number): Promise<boolean | Error> {
    try {
      const sourceTemplate = await this.getTemplateById(templateId)
      if (sourceTemplate instanceof Error) throw new Error("Source template not found")

      const newTemplate: ResponseTemplateCreationAttributes = {
        title: `${sourceTemplate.title} duplicate`,
        body: sourceTemplate.body,
        code: sourceTemplate.code,
        user_id: 1
      }

      await this.createTemplate(newTemplate)

      return true
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }
}

export { TemplateService }
