import { uuid } from "uuidv4"

import { DB } from "../database"

import type { EndpointAttributes, EndpointCreationAttributes } from "../database/interfaces/endpoint.interface"

class EndpointService {
  public async getEndpoint(path: string, method: string): Promise<EndpointAttributes | Error> {
    const response = await DB.models.Endpoint.findOne({
      where: {
        path,
        method
      },
      include: [
        {
          model: DB.models.ResponseTemplate,
          as: "response"
        },
        {
          model: DB.models.RelayPayloadTemplate,
          as: "relay_payload"
        },
        {
          model: DB.models.EndpointTemplateReference,
          as: "multiple_responses",
          include: [
            {
              model: DB.models.ResponseTemplate,
              as: "response"
            }
          ]
        }
      ]
    })

    if (!response) throw new Error("Endpoint not found")
    return response.toJSON()
  }

  public async getEndpointById(id: number): Promise<EndpointAttributes | Error> {
    const response = await DB.models.Endpoint.findOne({
      where: { id },
      include: [
        {
          model: DB.models.ResponseTemplate,
          as: "response"
        }
      ]
    })

    if (!response || !response.id) throw new Error("Endpoint not found")
    return this.formatEndpoint(response.toJSON())
  }

  public async getEndpointsList(): Promise<Array<EndpointAttributes> | Error> {
    const response = await DB.models.Endpoint.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: DB.models.ResponseTemplate,
          as: "response"
        }
      ]
    })

    if (!response) throw new Error("Endpoints not found")
    return response.map(item => this.formatEndpoint(item.dataValues))
  }

  public async createEndpoint(payload: EndpointCreationAttributes): Promise<EndpointAttributes | Error> {
    const newPayload = this.getPayload({ ...payload, user_id: 1, uuid: uuid().toString() })
    const exists = await DB.models.Endpoint.findOne({
      where: {
        path: newPayload.path,
        method: newPayload.method
      }
    })

    if (exists?.id) throw new Error("Endpoint already exists")

    await this.checkTemplate(payload)

    const response = await DB.models.Endpoint.create(newPayload)
    if (!response) throw new Error("Error while creating endpoint")
    return this.formatEndpoint(response.toJSON())
  }

  public async updateEndpoint(
    endpointId: number,
    payload: EndpointCreationAttributes
  ): Promise<EndpointAttributes | Error> {
    const endpoint = await DB.models.Endpoint.findByPk(endpointId)
    if (!endpoint?.id) throw new Error("Endpoint not found")

    await this.checkTemplate(payload)

    const newPayload = this.getPayload(payload)
    await endpoint.update(newPayload)

    const response = await DB.models.Endpoint.findOne({
      where: { id: endpointId },
      include: [
        {
          model: DB.models.ResponseTemplate,
          as: "response"
        }
      ]
    })
    if (!response) throw new Error("Endpoint not found")

    return this.formatEndpoint(response.toJSON())
  }

  public async deleteEndpoint(id: number): Promise<boolean | Error> {
    const exists = await DB.models.Endpoint.findByPk(id)
    if (!exists?.id) throw new Error("Endpoint not found")

    const transaction = await DB.sequelize.transaction()

    try {
      await DB.models.Endpoint.destroy({ where: { id }, transaction })
      await DB.models.Log.destroy({ where: { endpoint_id: id }, transaction })

      await transaction.commit()
      return true
    } catch {
      await transaction.rollback()
      return false
    }
  }

  private async checkTemplate(payload: EndpointCreationAttributes) {
    if (!payload.response_template_id) return

    const templateResponse = await DB.models.ResponseTemplate.findByPk(payload.response_template_id)
    if (!templateResponse?.id) throw new Error("Response template not found")
  }

  private getPayload(payload: EndpointCreationAttributes): EndpointCreationAttributes {
    const newPayload = { ...payload }
    if (newPayload.path[0] === "/") newPayload.path = newPayload.path.slice(1)
    delete newPayload.uuid
    return newPayload
  }

  private formatEndpoint(endpoint: EndpointAttributes): EndpointAttributes {
    const newEndpoint = { ...endpoint }
    if (newEndpoint.path[0] !== "/") newEndpoint.path = `/${newEndpoint.path}`
    return newEndpoint
  }
}

export { EndpointService }
