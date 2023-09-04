import { DeleteIcon } from "@chakra-ui/icons"

import { Input } from "@/ui/components/Form"

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
        <Input onChange={value => onUpdate(item.uuid, "key", value)} value={item.key} placeholder="key" />

        <div className={style.deleteButton}>
          <DeleteIcon _hover={{ cursor: "pointer" }} fontSize="19px" onClick={() => onDelete(item.uuid)} />
        </div>
      </div>
      <div className={style.container}>{children}</div>
    </div>
  )
}
