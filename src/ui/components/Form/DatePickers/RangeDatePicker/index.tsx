import classNames from "classnames"
import dayjs from "dayjs"
import React, { useRef, useState } from "react"
import ReactDatePicker, { type ReactDatePickerProps } from "react-datepicker"

import { CloseIcon } from "@chakra-ui/icons"

import style from "../style.module.scss"

import { PresetButtons } from "./PresetButtons"

import type { ButtonsVisible } from "./PresetButtons"
import type { FC } from "react"

import "../react-datepicker.scss"

export interface Dates {
  from: Date | null
  to: Date | null
  date?: Date | null
}

interface Props {
  startDate?: Date | null
  endDate?: Date | null
  signleDate?: Date | null
  single?: boolean
  label?: string
  noReset?: boolean
  wrapperClassName?: string
  onChange: (dates: Dates) => void
  buttonsVisible?: ButtonsVisible
  monthPicker?: boolean
  disabled?: boolean
}

const DatePicker = ReactDatePicker as React.JSXElementConstructor<ReactDatePickerProps<any, false>>
const DatePickerRange = ReactDatePicker as React.JSXElementConstructor<ReactDatePickerProps<any, true>>

const PLACEHOLDER = "Date filter"

export const RangeDatePicker: FC<Props> = ({
  onChange,
  startDate,
  endDate,
  signleDate,
  single = false,
  label = PLACEHOLDER,
  wrapperClassName,
  noReset,
  buttonsVisible = {},
  monthPicker,
  disabled
}) => {
  const [isOpen, setOpen] = useState(false)

  const datePickerRef = useRef(null)

  const onChangeHandler = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    if (end) setOpen(false)
    onChange({ from: start, to: end })
  }

  const onChangeHandlerSingle = (date: Date) => {
    setOpen(false)
    onChange({ from: null, to: null, date })
  }

  const onChangeHandlerMonth = (date: Date) => {
    setOpen(false)

    onChange({ from: date, to: dayjs(date).endOf("month").toDate() })
  }

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== datePickerRef.current) setOpen(false)
  }

  const onOpen = () => {
    !disabled && setOpen(!isOpen)
  }

  const onCloseHandler = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange({ from: null, to: null })
  }

  const getLabel = (): string => {
    if (single && signleDate) return dayjs(signleDate).format("DD MMM, YYYY")
    if (single) return label
    if (!startDate) return label

    const dateDifference = dayjs(startDate).diff(dayjs(endDate))

    if (!dateDifference) return dayjs(startDate).format("DD MMM, YYYY")

    return `${startDate ? dayjs(startDate).format("DD MMM, YYYY") : ""}
                ${endDate ? "-" : ""}
                ${endDate ? dayjs(endDate).format("DD MMM, YYYY") : ""}`
  }

  const hasButtons = Object.values(buttonsVisible).some(item => item)

  return (
    <div className={classNames(style.rangeDatePickerWrapper, { [style.withButtons]: hasButtons }, wrapperClassName)}>
      <div
        ref={datePickerRef}
        className={classNames(style.datePickerInfo, {
          [style.disabled]: disabled
        })}
        onClick={onOpen}
      >
        <span>{getLabel()}</span>
        {startDate && !noReset && <CloseIcon className={style.closeIcon} onClick={onCloseHandler} />}
      </div>
      {isOpen && (
        <div className={style.datePicker}>
          {single && !monthPicker && (
            <DatePicker selected={signleDate} onChange={onChangeHandlerSingle} onClickOutside={onOutsideClick} inline />
          )}

          {!single && !monthPicker && (
            <div className={style.calendarWrapper}>
              <DatePickerRange
                selected={startDate}
                onChange={onChangeHandler}
                startDate={startDate}
                endDate={endDate}
                onClickOutside={onOutsideClick}
                selectsRange
                inline
              >
                {hasButtons && <PresetButtons onChange={onChangeHandler} buttonsVisible={buttonsVisible} />}
              </DatePickerRange>
            </div>
          )}

          {monthPicker && (
            <div className={classNames(style.calendarWrapper, style.monthPicker)}>
              <DatePicker
                selected={startDate}
                onChange={onChangeHandlerMonth}
                startDate={startDate}
                onClickOutside={onOutsideClick}
                inline
                showMonthYearPicker
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
