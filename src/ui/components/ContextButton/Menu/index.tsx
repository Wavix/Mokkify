import classNames from "classnames"
import React from "react"

import style from "./style.module.scss"

import type { FC } from "react"

interface Item {
  title: string
  onClick?: () => void
}

interface Props {
  items: Array<Item>
  side: "left" | "bottom"
  onClose: () => void
}

export const ContextMenu: FC<Props> = ({ onClose, side, items }) => {
  const onClickHandler = (callback: (() => void) | undefined) => {
    onClose()
    if (callback) callback()
  }

  return (
    <div
      className={classNames(style.tableContext, {
        [style.bottom]: side === "bottom",
        [style.left]: side === "left"
      })}
    >
      <div className={style.contextList}>
        {items.map((item: Item) => (
          <div className={style.contextItemWrapper} key={item.title} onClick={() => onClickHandler(item.onClick)}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
}
