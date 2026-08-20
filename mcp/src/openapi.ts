import { z } from "zod"

export interface OpenApiOperation {
  operationId: string
  method: string
  path: string
  summary?: string
  description?: string
  parameters: OpenApiParameter[]
  requestBody?: OpenApiRequestBody
}

interface OpenApiParameter {
  name: string
  in: "path" | "query" | "header"
  required?: boolean
  description?: string
  schema?: JsonSchema
}

interface OpenApiRequestBody {
  required?: boolean
  content: Record<string, { schema?: JsonSchema }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>

const HTTP_METHODS = ["get", "put", "post", "delete", "patch", "options", "head"]

export function resolveRef<T = JsonSchema>(spec: JsonSchema, ref: string): T {
  const segments = ref.replace(/^#\//, "").split("/")
  const resolved = segments.reduce<JsonSchema>((node, key) => node?.[key], spec)
  if (resolved === undefined) throw new Error(`Unresolvable $ref: ${ref}`)
  return resolved as T
}

function resolveMaybeRef<T = JsonSchema>(spec: JsonSchema, node: T & { $ref?: string }): T {
  return node?.$ref ? resolveRef<T>(spec, node.$ref) : node
}

export function extractOperations(spec: JsonSchema): OpenApiOperation[] {
  const operations: OpenApiOperation[] = []

  for (const [path, pathItem] of Object.entries<JsonSchema>(spec.paths ?? {})) {
    const sharedParameters: OpenApiParameter[] = (pathItem.parameters ?? []).map((param: JsonSchema) =>
      resolveMaybeRef(spec, param)
    )

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method]
      if (!operation) continue

      const ownParameters: OpenApiParameter[] = (operation.parameters ?? []).map((param: JsonSchema) =>
        resolveMaybeRef(spec, param)
      )

      operations.push({
        operationId: operation.operationId,
        method,
        path,
        summary: operation.summary,
        description: operation.description,
        parameters: [...sharedParameters, ...ownParameters],
        requestBody: operation.requestBody
      })
    }
  }

  return operations
}

function getObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | undefined {
  const withShape = schema as unknown as { shape?: Record<string, z.ZodTypeAny> }
  return withShape.shape
}

function mergeSchemas(a: z.ZodTypeAny, b: z.ZodTypeAny): z.ZodTypeAny {
  const shapeA = getObjectShape(a)
  const shapeB = getObjectShape(b)
  if (shapeA && shapeB) return z.object({ ...shapeA, ...shapeB })
  return z.intersection(a, b)
}

function objectSchemaToZod(schema: JsonSchema, spec: JsonSchema): z.ZodTypeAny {
  if (schema.properties) {
    const required: string[] = schema.required ?? []
    const shape: Record<string, z.ZodTypeAny> = {}
    for (const [key, propSchema] of Object.entries<JsonSchema>(schema.properties)) {
      const fieldSchema = jsonSchemaToZod(propSchema, spec)
      shape[key] = required.includes(key) ? fieldSchema : fieldSchema.optional()
    }
    return z.object(shape)
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    return z.record(z.string(), jsonSchemaToZod(schema.additionalProperties, spec))
  }
  return z.record(z.string(), z.unknown())
}

export function jsonSchemaToZod(schema: JsonSchema | undefined, spec: JsonSchema): z.ZodTypeAny {
  if (!schema) return z.unknown()
  if (schema.$ref) return jsonSchemaToZod(resolveRef(spec, schema.$ref), spec)
  if (schema.allOf) return (schema.allOf as JsonSchema[]).map(s => jsonSchemaToZod(s, spec)).reduce(mergeSchemas)
  if (schema.anyOf) {
    const [first, ...rest] = (schema.anyOf as JsonSchema[]).map(s => jsonSchemaToZod(s, spec))
    return rest.reduce((acc, s) => z.union([acc, s]), first)
  }
  if (schema.enum) return z.enum(schema.enum as [string, ...string[]])

  const types: string[] = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []
  const nullable = types.includes("null")
  const primaryType = types.find(type => type !== "null")

  let zodSchema: z.ZodTypeAny
  switch (primaryType) {
    case "string":
      zodSchema = z.string()
      break
    case "integer":
    case "number":
      zodSchema = z.number()
      break
    case "boolean":
      zodSchema = z.boolean()
      break
    case "array":
      zodSchema = z.array(jsonSchemaToZod(schema.items, spec))
      break
    case "object":
      zodSchema = objectSchemaToZod(schema, spec)
      break
    default:
      zodSchema = z.unknown()
  }

  return nullable ? zodSchema.nullable() : zodSchema
}

export function buildInputShape(operation: OpenApiOperation, spec: JsonSchema): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const param of operation.parameters) {
    if (param.in === "header") continue
    let fieldSchema = jsonSchemaToZod(param.schema, spec)
    if (!param.required) fieldSchema = fieldSchema.optional()
    if (param.description) fieldSchema = fieldSchema.describe(param.description)
    shape[param.name] = fieldSchema
  }

  const requestBody = operation.requestBody
  if (requestBody) {
    const mediaType = requestBody.content["application/json"] ? "application/json" : Object.keys(requestBody.content)[0]
    if (mediaType === "application/json") {
      const bodySchema = jsonSchemaToZod(requestBody.content[mediaType].schema, spec)
      shape.body = requestBody.required ? bodySchema : bodySchema.optional()
    } else if (mediaType === "multipart/form-data") {
      shape.file_path = z.string().describe("Absolute path to the local file to upload")
    }
  }

  return shape
}
