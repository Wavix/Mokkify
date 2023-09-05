import classNames from "classnames"

import { AddNestIcon, PlusIcon, ArrayIcon } from "./icons"
import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  title: string
  icon: "nested" | "plus" | "array"
  color?: "blue" | "purple"
  onClick: () => void
}

export const ControlButton: FC<Props> = ({ title, icon, onClick, color = "purple" }) => {
  const getIcon = () => {
    switch (icon) {
      case "nested":
        return <AddNestIcon />

      case "plus":
        return <PlusIcon />

      case "array":
        return <ArrayIcon />

      default:
        return null
    }
  }

  return (
    <div className={classNames(style.controllButton, { [style.colorBlue]: color === "blue" })} onClick={onClick}>
      <div>{getIcon()}</div>
      <div className={style.title}>{title}</div>
    </div>
  )
}
