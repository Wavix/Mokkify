import { CircleHelp } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import type { FC } from "react"

interface Props {
  value: string
  hint?: string
}

export const HintLabel: FC<Props> = ({ value, hint }) => {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
      <div>{value}</div>
      {hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleHelp className="text-muted-foreground size-3.5" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px]">{hint}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
