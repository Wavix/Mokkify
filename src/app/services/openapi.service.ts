import { load as loadYaml } from "js-yaml"
import { v4 } from "uuid"

import { DB } from "../database"

import type { Method } from "../database/interfaces/endpoint.interface"

interface OpenApiSchema {
  $ref?: string
  type?: string
  format?: string
  enum?: Array<unknown>
  example?: unknown
  default?: unknown
  properties?: Record<string, OpenApiSchema>
  items?: OpenApiSchema
  oneOf?: Array<OpenApiSchema>
  anyOf?: Array<OpenApiSchema>
  allOf?: Array<OpenApiSchema>
}

interface OpenApiMediaType {
  schema?: OpenApiSchema
  example?: unknown
  examples?: Record<string, { value?: unknown }>
}

interface OpenApiResponse {
  description?: string
  content?: Record<string, OpenApiMediaType>
}

interface OpenApiOperation {
  summary?: string
  operationId?: string
  responses?: Record<string, OpenApiResponse>
}

interface OpenApiSpec {
  paths?: Record<string, Record<string, OpenApiOperation>>
  components?: { schemas?: Record<string, OpenApiSchema> }
  definitions?: Record<string, OpenApiSchema>
}

export interface ImportResult {
  created: number
  skipped: Array<string>
}

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head"]
const MAX_SCHEMA_DEPTH = 6

class OpenApiService {
  public async importSpec(specContent: string): Promise<ImportResult> {
    const spec = this.parseSpec(specContent)
    if (!spec.paths || !Object.keys(spec.paths).length) throw new Error("No paths found in the specification")

    this.setSchemas(spec)

    const result: ImportResult = { created: 0, skipped: [] }

    for (const [specPath, operations] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(operations || {})) {
        if (!HTTP_METHODS.includes(method)) continue

        const upperMethod = method.toUpperCase() as Method
        const path = this.convertPath(specPath)
        const label = `${upperMethod} ${specPath}`

        const exists = await DB.models.Endpoint.findOne({ where: { path, method: upperMethod } })
        if (exists?.id) {
          result.skipped.push(label)
          continue
        }

        const response = this.pickResponse(operation)
        const template = await DB.models.ResponseTemplate.create({
          title: `${operation.summary || label} response`,
          body: response.body,
          code: response.code,
          content_type: response.contentType,
          headers: null,
          user_id: 1
        })

        await DB.models.Endpoint.create({
          uuid: v4().toString(),
          title: operation.summary || operation.operationId || label,
          path,
          method: upperMethod,
          response_template_id: template.id,
          is_multiple_templates: false,
          max_pending_time: null,
          relay_enabled: false,
          relay_target: null,
          relay_method: "POST",
          relay_payload_template_id: null,
          user_id: 1
        })

        result.created += 1
      }
    }

    return result
  }

  private parseSpec(content: string): OpenApiSpec {
    try {
      return JSON.parse(content)
    } catch {
      try {
        return loadYaml(content) as OpenApiSpec
      } catch {
        throw new Error("Specification is neither valid JSON nor valid YAML")
      }
    }
  }

  // OpenAPI "/pets/{petId}" -> Mokkify "pets/:petId" (stored without leading slash)
  private convertPath(specPath: string): string {
    const converted = specPath.replaceAll(/\{([^}]+)\}/g, ":$1")
    return converted.startsWith("/") ? converted.slice(1) : converted
  }

  private pickResponse(operation: OpenApiOperation): { code: number; contentType: string; body: string } {
    const responses = operation.responses || {}
    const statuses = Object.keys(responses).sort((a, b) => {
      const rank = (status: string) => (status.startsWith("2") ? 0 : status === "default" ? 2 : 1)
      return rank(a) - rank(b)
    })

    const status = statuses[0]
    if (!status) return { code: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }

    const code = Number.isNaN(Number(status)) ? 200 : Number(status)
    const content = responses[status]?.content || {}
    const contentType =
      Object.keys(content).find(type => type.includes("json")) || Object.keys(content)[0] || "application/json"
    const media = content[contentType]

    const example =
      media?.example ??
      (media?.examples ? Object.values(media.examples)[0]?.value : undefined) ??
      (media?.schema ? this.schemaToExample(media.schema, 0) : undefined)

    const body = contentType.includes("json")
      ? JSON.stringify(example ?? { success: true }, null, 0)
      : String(example ?? "")

    return { code, contentType, body }
  }

  private resolveRef(schema: OpenApiSchema): OpenApiSchema {
    if (!schema.$ref) return schema

    const name = schema.$ref.split("/").pop() || ""
    return this.schemas[name] || {}
  }

  private schemaToExample(rawSchema: OpenApiSchema, depth: number): unknown {
    if (depth > MAX_SCHEMA_DEPTH) return null

    const schema = this.resolveRef(rawSchema)

    if (schema.example !== undefined) return schema.example
    if (schema.default !== undefined) return schema.default
    if (schema.enum?.length) return schema.enum[0]

    const variant = schema.oneOf?.[0] || schema.anyOf?.[0]
    if (variant) return this.schemaToExample(variant, depth + 1)

    if (schema.allOf?.length) {
      const merged: Record<string, unknown> = {}
      for (const part of schema.allOf) {
        const value = this.schemaToExample(part, depth + 1)
        if (value && typeof value === "object") Object.assign(merged, value)
      }
      return merged
    }

    switch (schema.type) {
      case "object":
        return this.objectExample(schema, depth)
      case "array":
        return [schema.items ? this.schemaToExample(schema.items, depth + 1) : null]
      case "integer":
      case "number":
        return 1
      case "boolean":
        return true
      case "string":
        return this.stringExample(schema.format)
      default:
        if (schema.properties) return this.objectExample(schema, depth)
        return null
    }
  }

  private objectExample(schema: OpenApiSchema, depth: number): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, property] of Object.entries(schema.properties || {})) {
      result[key] = this.schemaToExample(property, depth + 1)
    }
    return result
  }

  private stringExample(format?: string): string {
    switch (format) {
      case "uuid":
        return "@uuid"
      case "date-time":
        return "@date"
      case "date":
        return "@dateYYYYMMDD"
      case "email":
        return "user@example.com"
      case "uri":
        return "https://example.com"
      default:
        return "string"
    }
  }

  private schemas: Record<string, OpenApiSchema> = {}

  private setSchemas(spec: OpenApiSpec) {
    this.schemas = { ...(spec.definitions || {}), ...(spec.components?.schemas || {}) }
  }
}

export { OpenApiService }
