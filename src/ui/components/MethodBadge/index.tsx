import { cn } from "@/lib/utils"

import type { Method } from "@/app/database/interfaces/endpoint.interface"
import type { FC } from "react"

interface Props {
  method: Method
}

const METHOD_CLASSES: Record<string, string> = {
  GET: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  POST: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PATCH: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  PUT: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  HEAD: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  OPTIONS: "bg-blue-500/10 text-blue-700 dark:text-blue-400"
}

export const MethodBadge: FC<Props> = ({ method }) => {
  return (
    <span
      className={cn(
        "flex h-5 w-12 items-center justify-center rounded text-[10.5px] font-semibold tracking-wide select-none",
        METHOD_CLASSES[method.toUpperCase()] || "bg-muted text-muted-foreground"
      )}
    >
      {method.toUpperCase()}
    </span>
  )
}
