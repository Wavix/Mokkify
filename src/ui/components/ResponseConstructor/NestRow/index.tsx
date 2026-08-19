import { Trash2 } from "lucide-react"

import { Input } from "@/ui/components/Form"

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
    <div className="border-border mb-5 border-l border-dashed">
      <div className="bg-muted/60 grid h-12 grid-cols-[auto_1fr] content-center rounded-r-lg pl-[30px]">
        <Input onChange={value => onUpdate(item.uuid, "key", value)} value={item.key} placeholder="key" />

        <div className="self-center justify-self-end pr-2">
          <button
            type="button"
            data-id="nestRow.delete"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={() => onDelete(item.uuid)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="pt-[14px] pl-[30px]">{children}</div>
    </div>
  )
}
