import classNames from "classnames"
import React from "react"

import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  perPageValues: Array<number>
  currentPerPageValue: number
  onClick: (newPerPageValue: number) => () => void
}

export const PerPageSelect: FC<Props> = ({ perPageValues, currentPerPageValue, onClick }) => {
  return (
    <>
      <div className={style.perPageTitle}>Per page:</div>
      {perPageValues.map(perPageValue => (
        <div
          className={classNames(style.paginatorItem, {
            [style.paginatorItemActive]: perPageValue === currentPerPageValue
          })}
          key={perPageValue}
          onClick={onClick(perPageValue)}
        >
          {perPageValue}
        </div>
      ))}
    </>
  )
}
