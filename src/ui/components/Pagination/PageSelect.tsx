import classNames from "classnames"
import React from "react"

import { ArrowIcon } from "./ArrowIcon"
import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  currentPage: number
  onClick: (newPageNumber: number) => () => void
  pageNumbers: Array<number>
  totalPages: number
}

export const PageSelect: FC<Props> = ({ currentPage, onClick, pageNumbers, totalPages }) => {
  const isShowMinPage = pageNumbers.indexOf(1) === -1
  const isShowMaxPage = pageNumbers.indexOf(totalPages) === -1

  return (
    <div className={style.paginatorItemsContainer}>
      {currentPage > 1 && (
        <div className={classNames(style.paginatorItem, style.navPrevious)} onClick={onClick(currentPage - 1)}>
          <ArrowIcon className={style.navIcon} />
        </div>
      )}

      {isShowMinPage && (
        <>
          <div
            className={classNames(style.paginatorItem, { [style.paginatorItemActive]: currentPage === 1 })}
            key={1}
            onClick={onClick(1)}
          >
            1
          </div>
          <div className={classNames(style.paginatorItem, style.paginatorItemTransparent)}>...</div>
        </>
      )}

      {pageNumbers.map(pageNumber => (
        <div
          className={classNames(style.paginatorItem, { [style.paginatorItemActive]: pageNumber === currentPage })}
          key={pageNumber}
          onClick={pageNumber !== currentPage ? onClick(pageNumber) : undefined}
        >
          {pageNumber}
        </div>
      ))}

      {isShowMaxPage && (
        <React.Fragment>
          <div className={classNames(style.paginatorItem, style.paginatorItemTransparent)}>...</div>
          <div
            className={classNames(style.paginatorItem, { [style.paginatorItemActive]: currentPage === totalPages })}
            key={totalPages}
            onClick={onClick(totalPages)}
          >
            {totalPages}
          </div>
        </React.Fragment>
      )}

      {currentPage < totalPages && (
        <div className={classNames(style.paginatorItem, style.navNext)} onClick={onClick(currentPage + 1)}>
          <ArrowIcon className={style.navIcon} />
        </div>
      )}
    </div>
  )
}
