import { uuid as uuidv4 } from "uuidv4"

import { FieldOption } from "./types"

import type { ResponseConstructorItem } from "./types"

export const objectToConstructor = (
  obj: any,
  parentUUID: string | null = null,
  output: Array<ResponseConstructorItem> = []
) => {
  const parrent = output.find(item => item.uuid === parentUUID)

  Object.entries(obj).forEach(([key, value]) => {
    const uuid = uuidv4().toString()
    const isValueIsObject = value !== null && typeof value === "object"

    if (parrent?.type === FieldOption.Array && isValueIsObject) {
      output.push({ uuid, parentUUID, key, type: FieldOption.ArrayElement })
      objectToConstructor(value, uuid, output)
      return
    }

    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      output.push({ uuid, parentUUID, key })
      objectToConstructor(value, uuid, output)
    } else if (typeof value === "object" && Array.isArray(value)) {
      output.push({ uuid, parentUUID, key, type: FieldOption.Array })
      objectToConstructor(value, uuid, output)
    } else {
      const type = getContentType(value)
      const isArrayItem = parrent?.type === FieldOption.Array
      // @ts-ignore
      output.push({ uuid, parentUUID, key, value, type, ...(isArrayItem && { isArrayItem: true }) })
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
        const array = constructorToString(arr, element.uuid)
        jsonObject[element.key] = Array.isArray(array) ? array : []
        return
      }

      if (element.type === FieldOption.ArrayElement) {
        if (!Object.keys(jsonObject).length) jsonObject = []
        jsonObject = [...jsonObject, constructorToString(arr, element.uuid)]
        return
      }

      if ("value" in element && element.isArrayItem) {
        jsonObject = Array.isArray(jsonObject) ? [...jsonObject, element.value] : [element.value]
        return
      }

      if ("value" in element) {
        jsonObject[element.key] = element.value
        return
      }

      jsonObject[element.key] = constructorToString(arr, element.uuid)
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
