import { Brackets, ListTree, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

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
      variant={color === "blue" ? "outline" : "secondary"}
      data-id={`controlButton.${title}`}
      className="h-7 px-2.5 text-xs font-medium"
      onClick={onClick}
    >
      <Icon className="size-3.5" />
      {title}
    </Button>
  )
}
