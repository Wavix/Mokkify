import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"

import { config } from "@/config"

import { PageSelect } from "./PageSelect"
import { PerPageSelect } from "./PerPageSelect"
import style from "./style.module.scss"

import type { FC } from "react"

export { usePagination } from "./hook"

export interface PageProperties {
  perPage: number
  currentPage: number
}

interface Props {
  perPage?: Array<number>
  pagination: Pagination
}

const MAX_PAGE_SELECT_SIZE = 5
const MIN_PAGE_SELECT_SIZE = 2

export const Pagination: FC<Props> = ({ pagination, perPage = config.perPageDefaults }) => {
  const router = useRouter()

  const { total, limit: perPageValue, current_page: currentPage, total_pages: totalPages } = pagination

  const [currentPerPageValue, setCurrentPerPageValue] = useState(perPageValue)
  const [currentPageNumber, setCurrentPageNumber] = useState(currentPage)

  const range = (start: number, end: number): Array<number> => {
    return Array.from({ length: end - start }).reduce((acc: Array<number>, _, i) => [...acc, start + i], [])
  }

  const pageNumbersMiddle = Math.floor(MAX_PAGE_SELECT_SIZE / 2) + (MAX_PAGE_SELECT_SIZE % 2)
  const rangeToMiddle = MAX_PAGE_SELECT_SIZE - pageNumbersMiddle

  let firstPageNumber = Math.max(1, currentPageNumber - rangeToMiddle)
  let lastPageNumber = Math.min(totalPages, currentPageNumber + rangeToMiddle)

  if (currentPageNumber < pageNumbersMiddle) {
    lastPageNumber = totalPages >= MAX_PAGE_SELECT_SIZE ? MAX_PAGE_SELECT_SIZE : totalPages
  }

  if (lastPageNumber === totalPages) {
    firstPageNumber = lastPageNumber - MAX_PAGE_SELECT_SIZE >= 0 ? lastPageNumber - MAX_PAGE_SELECT_SIZE + 1 : 1
  }

  const pageNumbers = range(firstPageNumber, lastPageNumber + 1)

  const onChange = (newPerPage: number, newCurrentPage: number) => {
    router.query.page = newCurrentPage.toString()
    router.query.limit = newPerPage.toString()
    router.push(router)
  }

  const onClickPageSelect = (newPageNumber: number) => () => {
    window.scrollTo(0, 0)
    setCurrentPageNumber(newPageNumber)
    onChange(currentPerPageValue, newPageNumber)
  }

  const onClickPerPageSelect = (newPerPageValue: number) => () => {
    window.scrollTo(0, 0)
    setCurrentPerPageValue(newPerPageValue)
    setCurrentPageNumber(1)
    onChange(newPerPageValue, currentPage)
  }

  useEffect(() => {
    setCurrentPerPageValue(perPageValue)
    setCurrentPageNumber(currentPage)
  }, [currentPage, perPageValue])

  if (totalPages < 1) return <div className={style.empty} />

  return (
    <div className={style.paginatorContainer}>
      <div className={style.paginatorItemsContainer}>
        {!!perPage && !!total && total > perPage[0] && (
          <PerPageSelect
            perPageValues={perPage}
            currentPerPageValue={currentPerPageValue}
            onClick={onClickPerPageSelect}
          />
        )}
      </div>

      {totalPages >= MIN_PAGE_SELECT_SIZE && (
        <PageSelect
          currentPage={currentPageNumber}
          onClick={onClickPageSelect}
          pageNumbers={pageNumbers}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
