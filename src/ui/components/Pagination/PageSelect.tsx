import { ChevronLeft, ChevronRight } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"

import type { FC } from "react"

interface Props {
  currentPage: number
  onClick: (newPageNumber: number) => () => void
  pageNumbers: Array<number>
  totalPages: number
}

interface PageButtonProps {
  page: number
  isActive: boolean
  onClick?: () => void
}

const PageButton: FC<PageButtonProps> = ({ page, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    size="icon"
    className="size-9"
    data-id={`pagination.page.${page}`}
    onClick={onClick}
  >
    {page}
  </Button>
)

const Ellipsis = () => <span className="text-muted-foreground px-1 select-none">…</span>

export const PageSelect: FC<Props> = ({ currentPage, onClick, pageNumbers, totalPages }) => {
  const isShowMinPage = pageNumbers.indexOf(1) === -1
  const isShowMaxPage = pageNumbers.indexOf(totalPages) === -1

  return (
    <div className="my-5 mt-6 flex items-center gap-1">
      {currentPage > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          data-id="pagination.previous"
          onClick={onClick(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>
      )}

      {isShowMinPage && (
        <>
          <PageButton page={1} isActive={currentPage === 1} onClick={onClick(1)} />
          <Ellipsis />
        </>
      )}

      {pageNumbers.map(pageNumber => (
        <PageButton
          key={pageNumber}
          page={pageNumber}
          isActive={pageNumber === currentPage}
          onClick={pageNumber !== currentPage ? onClick(pageNumber) : undefined}
        />
      ))}

      {isShowMaxPage && (
        <>
          <Ellipsis />
          <PageButton page={totalPages} isActive={currentPage === totalPages} onClick={onClick(totalPages)} />
        </>
      )}

      {currentPage < totalPages && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          data-id="pagination.next"
          onClick={onClick(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  )
}
