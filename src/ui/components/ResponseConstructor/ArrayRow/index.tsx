import { Trash2, X } from "lucide-react"
import React from "react"
import { v4 } from "uuid"

import { AttributeRow } from "../AttributeRow"
import { ControlButton } from "../ControlButton"
import { FieldOption } from "../types"

import { Input } from "@/ui/components/Form"

import type { ResponseConstructorItem, ObjectAttribute } from "../types"
import type { FC, JSX } from "react"

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
  const children = items.filter(item => item.parentUUID === uuid)

  const onArrayAddObject = () => {
    const newData = [
      ...items,
      {
        type: FieldOption.ArrayElement,
        uuid: v4().toString(),
        key: "",
        parentUUID: uuid
      }
    ]
    onSetConstructor(newData)
  }

  const onArrayAddItem = () => {
    const newData = [
      ...items,
      {
        type: FieldOption.String,
        uuid: v4().toString(),
        key: "",
        value: "",
        parentUUID: uuid,
        isArrayItem: true
      }
    ]
    onSetConstructor(newData)
  }

  const buildArray = () => {
    return children.map(element => (
      <React.Fragment key={element.uuid}>
        {"value" in element ? (
          <AttributeRow item={element} onUpdate={onUpdate} onDelete={onDelete} />
        ) : (
          <div className="border-foreground/30 bg-muted/50 relative mb-2.5 rounded-l-md border-l p-6 pt-5 pb-px">
            <button
              type="button"
              data-id="arrayRow.deleteObject"
              className="bg-foreground text-background absolute -top-1 -right-1 flex size-4 cursor-pointer items-center justify-center rounded-full"
              onClick={() => onDelete(element.uuid)}
            >
              <X className="size-3" />
            </button>
            {buildTree(element.uuid)}
          </div>
        )}
      </React.Fragment>
    ))
  }

  return (
    <div className="mb-5">
      <div className="grid h-12 content-center gap-x-[14px] bg-muted/70 rounded-lg pl-3 [grid-template-columns:auto_auto_1fr_1fr]">
        <div className="text-muted-foreground flex items-center text-[13px] font-semibold">A</div>
        <Input onChange={value => onUpdate(uuid, "key", value)} value={arrayItem?.key} placeholder="key" />

        <div className="text-muted-foreground flex items-center text-xs">items: {children.length}</div>

        <div className="self-center justify-self-end pr-2">
          <button
            type="button"
            data-id="arrayRow.delete"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={() => onDelete(uuid)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="border-border border-l border-dashed pt-[14px] pl-2.5">
        {buildArray()}

        <div className="mb-5 flex gap-3">
          <ControlButton title="Add array object" icon="plus" onClick={() => onArrayAddObject()} color="blue" />
          <ControlButton title="Add array item" icon="plus" onClick={() => onArrayAddItem()} color="blue" />
        </div>
      </div>
    </div>
  )
}
