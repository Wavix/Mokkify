import ReactSelect from "react-select"

import { HintLabel } from "../HintLabel"

import style from "./style.module.scss"

import type { FC } from "react"

interface Option {
  label: string
  value: string | number | null
}

type Value = number | string | null | undefined
type MultiValue = Array<Value>

interface Props {
  title: string
  hint?: string
  value: Value | MultiValue
  isMulti?: boolean
  disabled?: boolean
  options: Array<Option>
  onChange?: (value: Value) => void
  onChangeMulti?: (value: MultiValue) => void
}

export const Select: FC<Props> = ({ title, hint, value, options, isMulti, disabled, onChange, onChangeMulti }) => {
  const getValue = () => {
    if (isMulti)
      return options.filter((option: Option) => (value as Array<number | string | null>).includes(option.value))
    return options.find((option: Option) => option.value === value)
  }

  const onChangeHandler = (newValue: Array<Option> | Option) => {
    if (!onChange && !onChangeMulti) return
    if (isMulti && onChangeMulti) {
      const result = (newValue as Array<Option>).reduce((acc: Array<Value>, item: Option) => [...acc, item.value], [])
      onChangeMulti(result)
      return
    }

    if (onChange) onChange((newValue as Option).value)
  }

  return (
    <div>
      <HintLabel value={title} hint={hint} />
      <ReactSelect
        value={getValue()}
        isDisabled={disabled}
        // @ts-ignore
        onChange={onChangeHandler}
        options={options}
        className={style.multiSelect}
        isMulti={isMulti}
      />
    </div>
  )
}
