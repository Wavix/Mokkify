import classNames from "classnames"
import { createRef, useEffect } from "react"

import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  value: string
  type: "text" | "password"
  placeHolder?: string
  focused?: boolean
  onChange: (value: string) => void
}

export const Input: FC<Props> = ({ value, type, placeHolder, focused, onChange }) => {
  const ref = createRef<HTMLInputElement>()

  useEffect(() => {
    if (focused) ref.current?.focus()
  }, [])

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeHolder}
      className={classNames(style.input, { [style.password]: value.trim() && type === "password" })}
      onChange={e => onChange(e.target.value)}
    />
  )
}
