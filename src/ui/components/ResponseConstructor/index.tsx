import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { BlockQuote } from "@/ui/components"

import { AttributeRow } from "./AttributeRow"
import { ControlButton } from "./ControlButton"
import { NestRow } from "./NestRow"
import { objectToConstructor, constructorToString, removeAttributeWithChildren } from "./helpers"
import style from "./style.module.scss"
import { FieldOption } from "./types"

import type { ResponseConstructorItem, ObjectAttribute } from "./types"
import type { FC } from "react"

interface Props {
  bodyRaw: string
  onChange: (value: string) => void
}

export const ResponseConstructor: FC<Props> = ({ bodyRaw, onChange }) => {
  const [constructorData, setConstructorData] = useState<Array<ResponseConstructorItem>>([])
  const [rawString, setRawString] = useState("")

  useEffect(() => {
    if (!bodyRaw) return
    setRawString(rawString)
    rawToConstructor()
  }, [bodyRaw])

  useEffect(() => {
    const result = constructorToString(constructorData)
    const parseVariables = result.replace(/"@([\w.]+)"/g, (_: unknown, variable: string) => `@${variable}`)
    setRawString(parseVariables)
    onChange(parseVariables)
  }, [constructorData])

  const rawToConstructor = () => {
    if (rawString && bodyRaw === rawString) return
    const jsonWithVariables = bodyRaw.replace(/@([\w.]+)/g, (_, variable) => `"@${variable}"`)

    try {
      const data = objectToConstructor(JSON.parse(jsonWithVariables))
      setConstructorData(data)
    } catch {
      setConstructorData([])
    }
  }

  const onAttributeDelete = (uuid: string) => {
    const newData = constructorData.filter(item => item.uuid !== uuid)
    setConstructorData(newData)
  }

  const onNestAttributeDelete = (uuid: string) => {
    const newData = removeAttributeWithChildren(uuid, constructorData)
    setConstructorData(newData)
  }

  const onUpdate = (uuid: string, attribute: ObjectAttribute, value: any) => {
    const data = [...constructorData]
    const elementIndex = data.findIndex(item => item.uuid === uuid)

    if (elementIndex === undefined) return
    data[elementIndex][attribute] = value

    if (attribute === "type" && value === FieldOption.Number) data[elementIndex].value = 0
    if (attribute === "type" && value === FieldOption.String) data[elementIndex].value = ""
    if (attribute === "type" && value === FieldOption.Null) data[elementIndex].value = null
    if (attribute === "type" && value === FieldOption.Boolean) data[elementIndex].value = false
    if (attribute === "type" && value === FieldOption.Dynamic) data[elementIndex].value = "@date"
    if (attribute === "type" && value === FieldOption.Variable) data[elementIndex].value = ""

    setConstructorData(data)
  }

  const addButton = (parentUUID: string | null) => (
    <div className={style.actions}>
      <ControlButton title="Add attribute" icon="plus" onClick={() => addAttribute(parentUUID, false)} />
      <ControlButton title="Add nested" icon="nested" onClick={() => addAttribute(parentUUID, true)} />
      {/* <ControlButton title="Add array" icon="nested" /> */}
    </div>
  )

  const addAttribute = (parentUUID: string | null, nest = false) => {
    const newData = [
      ...constructorData,
      {
        ...(!nest && { type: FieldOption.String, value: "" }),
        uuid: uuidv4(),
        key: "",
        parentUUID
      }
    ]
    setConstructorData(newData)
  }

  const buildParentGroupAttributes = (parentUUID: string | null = null) => {
    return constructorData
      .filter(item => item.parentUUID === parentUUID && item.type)
      .map(element => (
        <AttributeRow key={element.uuid} item={element} onUpdate={onUpdate} onDelete={onAttributeDelete} />
      ))
  }

  const buildParentNested = (parentUUID: string | null = null) => {
    return constructorData
      .filter(item => item.parentUUID === parentUUID && !item.type)
      .map(element => (
        <NestRow item={element} key={element.uuid} onUpdate={onUpdate} onDelete={onNestAttributeDelete}>
          {buildTree(element.uuid)}
        </NestRow>
      ))
  }

  const buildTree = (parentUUID: string | null = null) => {
    const data = constructorData.filter(item => item.parentUUID === parentUUID)
    if (!data.length) return addButton(parentUUID)

    return (
      <>
        <div>
          {buildParentGroupAttributes(parentUUID)}
          {addButton(parentUUID)}
        </div>

        {buildParentNested(parentUUID)}
      </>
    )
  }

  return (
    <>
      <div className={style.hint}>
        <BlockQuote>
          <p>Variables are values that can be obtained from either the request body or the response body.</p>
          <p>
            For example, if the request body contained {"{"}id: 1{"}"}, you can access it through @request.id.
          </p>
        </BlockQuote>
      </div>
      {buildTree()}
    </>
  )
}
