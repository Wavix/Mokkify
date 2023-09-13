import React, { useEffect, useState } from "react"

import { CloseIcon } from "@chakra-ui/icons"

import { Input } from "../Input"

import style from "./style.module.scss"

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

  const clearHandle = () => {
    setValue("")
    onChange("")
  }

  return (
    <div className={style.inputFilter}>
      <Input value={value || ""} type={type} placeholder={placeholder} onChange={onChangeHandle} />
      {value && <CloseIcon className={style.clear} onClick={clearHandle} />}
    </div>
  )
}
