import { DeleteIcon } from "@chakra-ui/icons"
import { Input } from "@chakra-ui/input"

import style from "./style.module.scss"

import type { ResponseConstructorItem, ObjectAttribute } from "../types"
import type { FC, ReactNode } from "react"

interface Props {
  item: ResponseConstructorItem
  children: ReactNode
  onUpdate: (uuid: string, attribute: ObjectAttribute, value: any) => void
  onDelete: (uuid: string) => void
}

export const NestRow: FC<Props> = ({ item, children, onDelete, onUpdate }) => {
  return (
    <div className={style.objectNested}>
      <div className={style.header}>
        <Input
          onChange={e => onUpdate(item.uuid, "key", e.target.value)}
          value={item.key}
          color="black"
          _placeholder={{ color: "grey" }}
          focusBorderColor="purple.400"
          placeholder="key"
        />

        <div className={style.deleteButton}>
          <DeleteIcon _hover={{ cursor: "pointer" }} fontSize="19px" onClick={() => onDelete(item.uuid)} />
        </div>
      </div>
      <div className={style.container}>{children}</div>
    </div>
  )
}
