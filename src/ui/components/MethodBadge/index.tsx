import { cn } from "@/lib/utils"

import type { Method } from "@/app/database/interfaces/endpoint.interface"
import type { FC } from "react"

interface Props {
  method: Method
}

const METHOD_CLASSES: Record<string, string> = {
  GET: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-300",
  POST: "bg-green-500/15 text-green-700 dark:text-green-300",
  PATCH: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  PUT: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  HEAD: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  OPTIONS: "bg-blue-500/15 text-blue-700 dark:text-blue-300"
}

export const MethodBadge: FC<Props> = ({ method }) => {
  return (
    <span
      className={cn(
        "flex h-6 w-14 items-center justify-center rounded-md text-xs font-semibold select-none",
        METHOD_CLASSES[method.toUpperCase()] || "bg-muted text-muted-foreground"
      )}
    >
      {method.toUpperCase()}
    </span>
  )
}
