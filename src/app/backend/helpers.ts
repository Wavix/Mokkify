import dayjs from "dayjs"
import { v4 as uuidv4 } from "uuid"

enum PayloadKeySource {
  Request = "request",
  Response = "response"
}

export const getBodyPayload = async (request: Request) => {
  try {
    return await request.json()
  } catch {
    return null
  }
}

// field1.array_field[0].field3.field4
export const getValueFromBodyByNestedKey = (nestedKeys: string, body: any) => {
  const keys = nestedKeys.split(".")
  let currentObj = body

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]

    if (key.includes("[")) {
      const [keyName, index] = key.split("[")
      const arrayIndex = Number(index.replace("]", ""))

      if (currentObj && typeof currentObj === "object" && currentObj[keyName][arrayIndex]) {
        currentObj = currentObj[keyName][arrayIndex]
        // eslint-disable-next-line no-continue
        continue
      } else {
        return null
      }
    }

    if (currentObj && typeof currentObj === "object" && key in currentObj) {
      currentObj = currentObj[key]
    } else {
      return null
    }
  }

  return {
    value: currentObj,
    type: typeof currentObj
  }
}

export const parseResponseBody = (
  responseString: string | null | undefined,
  requestBody?: unknown,
  responseBody?: unknown
): string | null => {
  if (!responseString) return null

  const paramsReplace = parseVars(responseString, requestBody, responseBody)
  const result = parseVars(paramsReplace, requestBody, responseBody, false)
  return result
}

const parseVars = (
  responseString: string | null,
  requestBody?: unknown,
  responseBody?: unknown,
  paramsReplace = true
): string | null => {
  if (!responseString) return null
  let result = responseString

  const regex = /@([a-zA-Z0-9_.[\]]+)([^a-zA-Z0-9_.[\]]|$)/g
  const matches = Array.from(responseString.matchAll(regex))

  if (!matches.length) return result
  for (const [, key] of matches) {
    let value = null

    if (key.includes(".")) {
      const [source, ...nestedKeyArray] = key.split(".")
      const nestedKey = nestedKeyArray.join(".")

      const body = source === PayloadKeySource.Request ? requestBody : responseBody
      const response = getValueFromBodyByNestedKey(nestedKey, body)
      if (!response) value = null
      value = response?.value === undefined ? null : response?.value
      if (response?.type === "string") value = `"${response.value}"`
    } else {
      value = parseVar(key)
    }

    if (value) value = value.replaceAll("\n", "\\n")

    result = paramsReplace
      ? result.replace(`":@${key}`, `":${value}`)
      : result.replace(`@${key}`, `${value}`.replaceAll('"', ""))
  }

  return result
}

const parseVar = (key: string): string | number | null => {
  switch (key) {
    case "uuid":
      return `"${uuidv4()}"`
    case "unix":
      return dayjs().unix()
    case "dateYYYYMMDD":
      return `"${dayjs().format("YYYYMMDD")}"`
    case "date":
      return `"${dayjs().toISOString()}"`
    default:
      return null
  }
}
