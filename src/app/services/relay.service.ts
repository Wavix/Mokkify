import { DB } from "../database"

import { getValueFromBodyByNestedKey, parseResponseBody } from "@/app/backend/helpers"

import type { EndpointWithResponse } from "@/app/database/interfaces/endpoint.interface"
import type {
  RelayPayloadTemplateAttributes,
  RelayPayloadTemplateCreationAttributes
} from "@/app/database/interfaces/relay-payload-template.interface"
import type { ApiResponse } from "@/app/services"
import type { Model } from "sequelize"

export interface RelayResponse {
  url: string | null
  method: string
  code: number
  requestBody: unknown
  responseBody: unknown
}

class RelayService {
  public async getRelayTemplateById(id: number): Promise<RelayPayloadTemplateAttributes | Error> {
    const response = await DB.models.RelayPayloadTemplate.findByPk(id)
    if (!response || !response.id) throw new Error("Relay template not found")

    return response.toJSON()
  }

  public async getRelaysList(): Promise<Array<RelayPayloadTemplateAttributes> | Error> {
    const response = await DB.models.RelayPayloadTemplate.findAll({
      order: [["id", "DESC"]]
    })

    if (!response) throw new Error("Relay templates request error")
    return response.map((item: Model<RelayPayloadTemplateAttributes>) => item.toJSON())
  }

  public async createRelayTemplate(
    payload: RelayPayloadTemplateCreationAttributes
  ): Promise<RelayPayloadTemplateAttributes | Error> {
    const response = await DB.models.RelayPayloadTemplate.create(payload)
    if (!response) throw new Error("Error while creating relay template")
    return response.toJSON()
  }

  public async updateRelayTemplate(
    relayTemplateId: number,
    payload: RelayPayloadTemplateCreationAttributes
  ): Promise<RelayPayloadTemplateAttributes | Error> {
    const template = await DB.models.RelayPayloadTemplate.findByPk(relayTemplateId)
    if (!template?.id) throw new Error("Relay template not found")

    const response = await template.update(payload)
    return response.toJSON()
  }

  public async deleteRelayTemplate(id: number): Promise<boolean | Error> {
    const exists = await DB.models.RelayPayloadTemplate.findByPk(id)
    if (!exists?.id) throw new Error("Relay template not found")

    try {
      await DB.models.RelayPayloadTemplate.destroy({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  public async duplicateRelayTemplate(relayTemplateId: number): Promise<boolean | Error> {
    try {
      const sourceTemplate = await this.getRelayTemplateById(relayTemplateId)
      if (sourceTemplate instanceof Error) throw new Error("Source relay template not found")

      const newTemplate: RelayPayloadTemplateCreationAttributes = {
        title: `${sourceTemplate.title} duplicate`,
        body: sourceTemplate.body,
        user_id: 1
      }

      await this.createRelayTemplate(newTemplate)
      return true
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  public async relay(
    requestBody: unknown,
    apiResponse: ApiResponse,
    endpoint: EndpointWithResponse
  ): Promise<RelayResponse | Error> {
    const url = await this.getRelayUrl(String(endpoint.relay_target), requestBody)
    const method = endpoint.relay_method || "GET"

    const result = {
      url,
      method,
      responseBody: null,
      requestBody: null
    }

    if (!url) return new Error("Relay target not found")

    try {
      const json = parseResponseBody(endpoint.relay_payload?.body, requestBody, apiResponse.body)

      const response = await fetch(url, {
        method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        ...(json && { body: json })
      })
      const body = await this.getRelayHookBody(response)

      // eslint-disable-next-line no-console
      console.log("RELAY", url, method, json, response.status, body)

      return {
        ...result,
        code: response.status,
        responseBody: body,
        requestBody: json ? JSON.parse(json) : null
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Relay fail with message:", (error as Error).message)

      return {
        ...result,
        code: 500
      }
    }
  }

  private async getRelayUrl(relayTarget: string, requestBody: unknown): Promise<string | null> {
    if (relayTarget.includes("://")) return relayTarget
    const relayFieldName = relayTarget

    if (requestBody && relayFieldName) return getValueFromBodyByNestedKey(relayFieldName, requestBody)?.value

    return null
  }

  private async getRelayHookBody(response: Response): Promise<unknown> {
    try {
      const data = await response.json()
      return data
    } catch {
      return null
    }
  }
}

export { RelayService }
