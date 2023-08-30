import { Op } from "sequelize"

import { DB } from "../database"

import type { EndpointTemplateReferenceAttributes } from "@/app/database/interfaces/endpoint-template-reference.interface"

class RandomTemplates {
  public async getEndpointTemplates(endpointId: number): Promise<Array<number>> {
    const response = await DB.models.EndpointTemplateReference.findAll({
      where: {
        endpoint_id: endpointId
      }
    })

    return response.map((reference: EndpointTemplateReferenceAttributes) => reference.template_id)
  }

  public async updateEndpointTemplates(endpointId: number, templateIds: Array<number>): Promise<boolean | Error> {
    const endpointExist = await this.isEndpointExist(endpointId)
    if (!endpointExist) throw new Error("Endpoint not found")

    const isTemplatesExist = await this.isTemplatesExist(templateIds)
    if (!isTemplatesExist) throw new Error("Templates not found. Please reload page")

    const payload = templateIds.map(templateId => ({ endpoint_id: endpointId, template_id: templateId }))

    await DB.models.EndpointTemplateReference.destroy({ where: { endpoint_id: endpointId } })
    await DB.models.EndpointTemplateReference.bulkCreate(payload)

    return true
  }

  private async isEndpointExist(endpointId: number): Promise<boolean> {
    const response = await DB.models.Endpoint.findByPk(endpointId)
    if (!response?.id) return false
    return true
  }

  private async isTemplatesExist(templatesIds: Array<number>): Promise<boolean> {
    const response = await DB.models.ResponseTemplate.findAll({ where: { id: { [Op.in]: templatesIds } } })
    if (response.length !== templatesIds.length) return false
    return true
  }
}

export { RandomTemplates }
