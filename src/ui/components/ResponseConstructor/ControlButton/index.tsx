import { Brackets, ListTree, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { FC } from "react"

interface Props {
  title: string
  icon: "nested" | "plus" | "array"
  color?: "blue" | "purple"
  onClick: () => void
}

const ICONS = {
  nested: ListTree,
  plus: Plus,
  array: Brackets
}

export const ControlButton: FC<Props> = ({ title, icon, onClick, color = "purple" }) => {
  const Icon = ICONS[icon]

  return (
    <Button
      type="button"
      size="sm"
      data-id={`controlButton.${title}`}
      className={cn(
        "h-7 px-3 text-[11px] font-semibold tracking-wide uppercase",
        color === "blue" && "bg-cyan-500 text-white hover:bg-cyan-600"
      )}
      onClick={onClick}
    >
      <Icon className="size-3.5" />
      {title}
    </Button>
  )
}
