import classNames from "classnames"
import React, { useRef, useState } from "react"
import { useClickAway } from "react-use"

import { Icon } from "./Icon"
import { ContextMenu } from "./Menu"
import style from "./style.module.scss"

interface Item {
  title: string
  onClick: () => void
}

interface Props {
  menu: Array<Item>
  side?: "left" | "bottom"
}

export const ContextButton: React.FC<Props> = ({ menu, side }) => {
  const [isContextOpened, setContextOpened] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const toggleContext = () => {
    setContextOpened(!isContextOpened)
  }

  useClickAway(ref, () => {
    if (isContextOpened) toggleContext()
  })

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={style.contextButtonWrapper} ref={ref} onClick={onClick}>
      <button
        onClick={toggleContext}
        className={classNames(style.button, {
          [style.active]: isContextOpened
        })}
        aria-label="Menu"
        type="button"
      >
        <Icon />
      </button>

      {isContextOpened && menu && (
        <ContextMenu side={side || "bottom"} onClose={() => setContextOpened(false)} items={menu} />
      )}
    </div>
  )
}
