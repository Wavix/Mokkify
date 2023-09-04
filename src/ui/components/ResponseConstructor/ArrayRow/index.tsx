import { v4 as uuidv4 } from "uuid"

import { DeleteIcon } from "@chakra-ui/icons"

import { FieldOption } from "../types"

import { Input } from "@/ui/components/Form"

import style from "./style.module.scss"

import type { ResponseConstructorItem, ObjectAttribute } from "../types"
import type { FC } from "react"

interface Props {
  items: Array<ResponseConstructorItem>
  uuid: string
  buildTree: (parentUUID: string | null) => JSX.Element
  onSetConstructor: (data: Array<ResponseConstructorItem>) => void
  onUpdate: (uuid: string, attribute: ObjectAttribute, value: any) => void
  onDelete: (uuid: string) => void
}

export const ArrayRow: FC<Props> = ({ uuid, items, buildTree, onSetConstructor, onDelete, onUpdate }) => {
  const arrayItem = items.find(constructorItem => constructorItem.uuid === uuid)

  const onArrayAddObject = () => {
    const newData = [
      ...items,
      {
        type: FieldOption.ArrayElement,
        uuid: uuidv4(),
        key: "",
        parentUUID: uuid
      }
    ]
    onSetConstructor(newData)
  }

  const buildArray = () => {
    return items
      .filter(element => element.parentUUID === uuid)
      .map(element => <div key={element.uuid}>ARRAY OBJECT {buildTree(element.uuid)}</div>)
  }

  return (
    <div className={style.objectArray}>
      <div className={style.header}>
        <Input onChange={value => onUpdate(uuid, "key", value)} value={arrayItem?.key} placeholder="key" />

        <div className={style.deleteButton}>
          <DeleteIcon _hover={{ cursor: "pointer" }} fontSize="19px" onClick={() => onDelete(uuid)} />
        </div>
      </div>
      <div className={style.container}>
        {buildArray()}
        <span onClick={() => onArrayAddObject()}>ADD ARRAY ELEMENT</span>
      </div>
    </div>
  )
}
