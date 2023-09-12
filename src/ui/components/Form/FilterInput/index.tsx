import React, { useEffect, useState } from "react"

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

  useEffect(() => {
    const timer = setTimeout(() => onChange(value), 1000)

    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const onChangeHandle = (val: string) => {
    const newValue = type === "number" ? Number(val) : val
    setValue(newValue || null)
  }

  return <Input value={value || ""} type={type} placeholder={placeholder} onChange={onChangeHandle} />
}
