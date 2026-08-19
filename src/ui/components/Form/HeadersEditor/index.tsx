import { Plus, Trash2 } from "lucide-react"

import { Input } from "../Input"

import { Button } from "@/components/ui/button"


import type { FC } from "react"

export interface HeaderRow {
  key: string
  value: string
}

interface Props {
  rows: Array<HeaderRow>
  onChange: (rows: Array<HeaderRow>) => void
}

export const HeadersEditor: FC<Props> = ({ rows, onChange }) => {
  const updateRow = (index: number, field: keyof HeaderRow, value: string) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)))
  }

  const removeRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_24px] items-center gap-x-[14px]">
          <Input placeholder="X-Request-Id" value={row.key} onChange={value => updateRow(index, "key", value)} />
          <Input placeholder="value" value={row.value} onChange={value => updateRow(index, "value", value)} />
          <button
            type="button"
            data-id="headersEditor.delete"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={() => removeRow(index)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 px-2.5 text-xs font-medium"
          data-id="headersEditor.add"
          onClick={() => onChange([...rows, { key: "", value: "" }])}
        >
          <Plus className="size-3.5" />
          Add header
        </Button>
      </div>
    </div>
  )
}
