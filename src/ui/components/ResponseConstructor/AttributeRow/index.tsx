import { DeleteIcon } from "@chakra-ui/icons"
import { Input } from "@chakra-ui/input"
import { FormControl, NumberInput, NumberInputField, Select } from "@chakra-ui/react"

import { FieldOption } from "../types"

import style from "./style.module.scss"

import type { ResponseConstructorItem, ObjectAttribute } from "../types"
import type { FC } from "react"

interface Props {
  item: ResponseConstructorItem
  onUpdate: (uuid: string, attribute: ObjectAttribute, value: any) => void
  onDelete: (uuid: string) => void
}

const varOptions = [
  { value: "@date", label: "Date" },
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
        <Input
          onChange={e => onUpdate(item.uuid, "key", e.target.value)}
          value={item.key}
          color="black"
          _placeholder={{ color: "grey" }}
          focusBorderColor="purple.400"
          placeholder="key"
        />
      </FormControl>

      <FormControl>
        <Select
          defaultValue={item.type}
          onChange={e => onUpdate(item.uuid, "type", e.target.value)}
          focusBorderColor="purple.400"
          isRequired
          color="black"
        >
          <option value={FieldOption.String}>String</option>
          <option value={FieldOption.Number}>Number</option>
          <option value={FieldOption.Boolean}>Boolean</option>
          <option value={FieldOption.Null}>Null</option>
          <option value={FieldOption.Dynamic}>Dynamic value</option>
          <option value={FieldOption.Variable}>Variable</option>
        </Select>
      </FormControl>

      <FormControl>
        {item.type === FieldOption.String && (
          <Input
            onChange={e => onUpdate(item.uuid, "value", e.target.value)}
            value={item.value as string}
            color="black"
            _placeholder={{ color: "grey" }}
            focusBorderColor="purple.400"
            placeholder="value - String"
          />
        )}

        {item.type === FieldOption.Null && (
          <Input
            value="NULL"
            isDisabled
            color="black"
            _placeholder={{ color: "grey" }}
            focusBorderColor="purple.400"
            placeholder="NULL"
          />
        )}

        {item.type === FieldOption.Number && (
          <NumberInput value={Number(item.value) || ""} focusBorderColor="purple.400">
            <NumberInputField
              onChange={e => onUpdate(item.uuid, "value", Number(e.target.value))}
              value={(item.value as string) || ""}
              placeholder="value - Number"
              color="black"
              _placeholder={{ color: "grey" }}
            />
          </NumberInput>
        )}

        {item.type === FieldOption.Dynamic && (
          <Select
            defaultValue={item.value as string}
            onChange={e => onUpdate(item.uuid, "value", e.target.value)}
            focusBorderColor="purple.400"
            isRequired
            color="black"
          >
            {varOptions.map(option => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}

        {item.type === FieldOption.Variable && (
          <Input
            value={item.value as string}
            onChange={e => onUpdate(item.uuid, "value", e.target.value)}
            color="black"
            _placeholder={{ color: "grey" }}
            focusBorderColor="purple.400"
            placeholder="@response.id"
          />
        )}

        {item.type === FieldOption.Boolean && (
          <Select
            defaultValue={item.value as string}
            onChange={e => onUpdate(item.uuid, "value", e.target.value === "true")}
            focusBorderColor="purple.400"
            isRequired
            color="black"
          >
            {booleanOptions.map(option => (
              <option value={option.value.toString()} key={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </FormControl>
      <DeleteIcon _hover={{ cursor: "pointer" }} fontSize="19px" onClick={() => onDelete(item.uuid)} />
    </div>
  )
}
