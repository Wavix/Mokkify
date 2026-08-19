import { EllipsisVertical } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Item {
  title: string
  onClick: () => void
}

interface Props {
  menu: Array<Item>
  side?: "left" | "bottom"
}

export const ContextButton: React.FC<Props> = ({ menu, side }) => {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div onClick={onClick}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7"
            aria-label="Menu"
            data-id="contextButton.trigger"
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side === "left" ? "left" : "bottom"} align="end">
          {menu.map(item => (
            <DropdownMenuItem key={item.title} data-id={`contextButton.${item.title}`} onClick={item.onClick}>
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
