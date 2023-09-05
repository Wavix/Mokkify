import { DeleteIcon } from "@chakra-ui/icons"
import { FormControl } from "@chakra-ui/react"

import { FieldOption } from "../types"

import { Input, Select } from "@/ui/components/Form"

import style from "./style.module.scss"

import type { ResponseConstructorItem, ObjectAttribute } from "../types"
import type { FC } from "react"

interface Props {
  item: ResponseConstructorItem
  onUpdate: (uuid: string, attribute: ObjectAttribute, value: any) => void
  onDelete: (uuid: string) => void
}

const dynamicOptions = [
  { value: "@date", label: "Date" },
  { value: "@dateYYYYMMDD", label: "Date (YYYYMMDD)" },
  { value: "@unix", label: "Unix time" },
  { value: "@uuid", label: "UUID" }
]

const booleanOptions = [
  { value: true, label: "True" },
  { value: false, label: "False" }
]

export const AttributeRow: FC<Props> = ({ item, onUpdate, onDelete }) => {
  return (
    <div className={style.objectRow}>
      <FormControl isRequired>
        <Input onChange={value => onUpdate(item.uuid, "key", value)} value={item.key} placeholder="key" />
      </FormControl>

      <FormControl>
        <Select
          value={item.type}
          options={[
            { value: FieldOption.String, label: "String" },
            { value: FieldOption.Number, label: "Number" },
            { value: FieldOption.Boolean, label: "Boolean" },
            { value: FieldOption.Null, label: "Null" },
            { value: FieldOption.Dynamic, label: "Dynamic value" },
            { value: FieldOption.Variable, label: "Variable" }
          ]}
          onChange={value => onUpdate(item.uuid, "type", value)}
        />
      </FormControl>

      <FormControl>
        {item.type === FieldOption.String && (
          <Input
            onChange={value => onUpdate(item.uuid, "value", value)}
            value={item.value as string}
            placeholder="value"
          />
        )}
        {item.type === FieldOption.Null && <Input value="null" disabled placeholder="NULL" />}
        {item.type === FieldOption.Number && (
          <Input
            onChange={value => onUpdate(item.uuid, "value", Number(value))}
            value={(item.value as string) || ""}
            placeholder="123"
            type="number"
          />
        )}
        {item.type === FieldOption.Dynamic && (
          <Select
            value={item.value as string}
            options={dynamicOptions}
            onChange={value => onUpdate(item.uuid, "value", value)}
          />
        )}
        {item.type === FieldOption.Variable && (
          <Input
            value={item.value as string}
            onChange={value => onUpdate(item.uuid, "value", value)}
            placeholder="@response.id"
          />
        )}
        {item.type === FieldOption.Boolean && (
          <Select
            value={item.value as string}
            options={booleanOptions}
            onChange={value => onUpdate(item.uuid, "value", !!value)}
          />
        )}
      </FormControl>
      <DeleteIcon _hover={{ cursor: "pointer" }} fontSize="19px" onClick={() => onDelete(item.uuid)} />
    </div>
  )
}
