import React from "react"

import { Button } from "@/components/ui/button"

import type { FC } from "react"

interface Props {
  perPageValues: Array<number>
  currentPerPageValue: number
  onClick: (newPerPageValue: number) => () => void
}

export const PerPageSelect: FC<Props> = ({ perPageValues, currentPerPageValue, onClick }) => {
  return (
    <div className="relative flex items-center gap-1">
      <div className="text-muted-foreground absolute -top-4 text-[13px] font-medium">Per page:</div>
      {perPageValues.map(perPageValue => (
        <Button
          key={perPageValue}
          variant={perPageValue === currentPerPageValue ? "secondary" : "ghost"}
          size="sm"
          className="h-8"
          data-id={`pagination.perPage.${perPageValue}`}
          onClick={onClick(perPageValue)}
        >
          {perPageValue}
        </Button>
      ))}
    </div>
  )
}
