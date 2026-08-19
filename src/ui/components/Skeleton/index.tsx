import { Skeleton as UISkeleton } from "@/components/ui/skeleton"

import type { FC } from "react"

interface Props {
  rows?: number
  height?: string
}

export const Skeleton: FC<Props> = ({ rows = 3, height = "40px" }) => {
  return (
    <div className="flex flex-col gap-2">
      {Array(rows)
        .fill(Number)
        .map((_, index) => (
          <UISkeleton key={index} style={{ height }} className="w-full" />
        ))}
    </div>
  )
}
