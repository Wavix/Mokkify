import { X } from "lucide-react"
import React, { useEffect, useState, useRef } from "react"

import { Input } from "../Input"

import type { FC } from "react"

interface Props {
  defaultValue: string | number | null
  type?: string
  onChange: (value: string | number | null) => void
  placeholder?: string
  clearIcon?: boolean
}

export const FilterInput: FC<Props> = ({ defaultValue, onChange, placeholder, type }) => {
  const [value, setValue] = useState<string | number | null>(defaultValue)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const onChangeHandle = (val: string) => {
    if (timeout.current) clearTimeout(timeout.current)
    const newValue = type === "number" ? Number(val) : val
    setValue(newValue || null)
    timeout.current = setTimeout(() => onChange(newValue || null), 1000)
  }

  const clearHandle = () => {
    setValue("")
    onChange("")
  }

  return (
    <div className="relative">
      <Input value={value || ""} type={type} placeholder={placeholder} onChange={onChangeHandle} />
      {value && (
        <button
          type="button"
          data-id="filterInput.clear"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
          onClick={clearHandle}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
