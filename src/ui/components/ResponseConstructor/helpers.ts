import { v4 as uuidv4 } from "uuid"

import { FieldOption } from "./types"

import type { ResponseConstructorItem } from "./types"

export const objectToConstructor = (
  obj: any,
  parentUUID: string | null = null,
  output: Array<ResponseConstructorItem> = []
) => {
  Object.entries(obj).forEach(([key, value]) => {
    const uuid = uuidv4()

    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      output.push({ uuid, parentUUID, key })
      objectToConstructor(value, uuid, output)
    } else {
      const type = getContentType(value)
      // @ts-ignore
      output.push({ uuid, parentUUID, key, value, type })
    }
  })

  return output
}

export const constructorToString = (arr: Array<ResponseConstructorItem>, rootParentUUID: string | null = null) => {
  if (!arr) return
  let jsonObject: any = {}

  arr
    .filter((element: ResponseConstructorItem) => element.parentUUID === rootParentUUID)
    .forEach((element: ResponseConstructorItem) => {
      if (element.type === FieldOption.Array) {
        jsonObject[element.key] = constructorToString(arr, element.uuid)
        return
      }

      if (element.type === FieldOption.ArrayElement) {
        if (!Object.keys(jsonObject).length) jsonObject = []
        jsonObject = [...jsonObject, constructorToString(arr, element.uuid)]
        return
      }

      if ("value" in element) {
        jsonObject[element.key] = element.value
      } else {
        jsonObject[element.key] = constructorToString(arr, element.uuid)
      }
    })

  return rootParentUUID === null ? JSON.stringify(jsonObject) : jsonObject
}

export const removeAttributeWithChildren = (parentUUID: string, list: Array<ResponseConstructorItem> = []) => {
  const children = list.filter(item => item.parentUUID === parentUUID)

  for (const child of children) {
    removeAttributeWithChildren(child.uuid, list)
  }

  return list.filter(item => item.uuid !== parentUUID && item.parentUUID !== parentUUID)
}

export const getContentType = (value: any): FieldOption => {
  if (value === null) return FieldOption.Null
  if (String(value).startsWith("@") && String(value).includes(".")) return FieldOption.Variable
  if (String(value).startsWith("@")) return FieldOption.Dynamic
  if (typeof value === "string") return FieldOption.String
  if (typeof value === "number") return FieldOption.Number
  if (typeof value === "boolean") return FieldOption.Boolean
  return FieldOption.Null
}
