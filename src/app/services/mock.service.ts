import { v4 } from "uuid"

import { DB } from "../database"

import type { EndpointAttributes, Method } from "../database/interfaces/endpoint.interface"

export interface MockResponsePayload {
  code: number
  content_type?: string
  headers?: Record<string, string> | null
  body: string | null
}

export interface MockRelayPayload {
  target: string
  method: Method
  body?: string
}

export interface MockCreationPayload {
  title: string
  path: string
  method: Method
  response: MockResponsePayload
  relay?: MockRelayPayload
  max_pending_time?: number | null
}

class MockService {
  public async createMock(payload: MockCreationPayload): Promise<EndpointAttributes> {
    const transaction = await DB.sequelize.transaction()

    try {
      const responseTemplate = await DB.models.ResponseTemplate.create(
        {
          title: payload.title,
          body: payload.response.body ?? "",
          code: payload.response.code,
          content_type: payload.response.content_type,
          headers: payload.response.headers,
          user_id: 1
        },
        { transaction }
      )

      let relayPayloadTemplateId: number | null = null
      if (payload.relay) {
        const relayPayloadTemplate = await DB.models.RelayPayloadTemplate.create(
          {
            title: payload.title,
            body: payload.relay.body || "",
            user_id: 1
          },
          { transaction }
        )
        relayPayloadTemplateId = relayPayloadTemplate.id
      }

      const path = payload.path[0] === "/" ? payload.path.slice(1) : payload.path

      const endpoint = await DB.models.Endpoint.create(
        {
          uuid: v4().toString(),
          title: payload.title,
          path,
          method: payload.method,
          response_template_id: responseTemplate.id,
          is_multiple_templates: false,
          max_pending_time: payload.max_pending_time ?? null,
          relay_enabled: !!payload.relay,
          relay_target: payload.relay?.target ?? null,
          relay_method: payload.relay?.method ?? "GET",
          relay_payload_template_id: relayPayloadTemplateId,
          user_id: 1
        },
        { transaction }
      )

      await transaction.commit()
      return endpoint.toJSON()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

export { MockService }
