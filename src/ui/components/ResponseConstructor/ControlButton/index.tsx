import { AddNestIcon, PlusIcon, ArrayIcon } from "./icons"
import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  title: string
  icon: "nested" | "plus" | "array"
  onClick: () => void
}

export const ControlButton: FC<Props> = ({ title, icon, onClick }) => {
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
    <div className={style.controllButton} onClick={onClick}>
      <div>{getIcon()}</div>
      <div className={style.title}>{title}</div>
    </div>
  )
}
