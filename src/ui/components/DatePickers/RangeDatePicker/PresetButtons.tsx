import React from "react"

import { getYesterday, getToday, getTwoDaysAgo, getThisWeek, getThisMonth } from "../helpers"
import style from "../style.module.scss"

import type { FC } from "react"

interface Props {
  buttonsVisible: ButtonsVisible
  onChange: (dates: [Date | null, Date | null]) => void
}

export interface ButtonsVisible {
  showTodayButton?: boolean
  showYesterdayButton?: boolean
  showTwoDaysButton?: boolean
  showThisWeekButton?: boolean
  showThisMonthButton?: boolean
}

export const PresetButtons: FC<Props> = ({ buttonsVisible, onChange }) => {
  const { showTodayButton, showYesterdayButton, showTwoDaysButton, showThisWeekButton, showThisMonthButton } =
    buttonsVisible

  const onSetToday = () => {
    const today = new Date(getToday())

    onChange([today, today])
  }

  const onSetYesterday = () => {
    const { from, to } = getYesterday()

    onChange([from, to])
  }

  const onSetTwoDaysAgo = () => {
    const { from, to } = getTwoDaysAgo()

    onChange([from, to])
  }

  const onSetThisWeek = () => {
    const { from, to } = getThisWeek()

    onChange([from, to])
  }

  const onSetThisMonth = () => {
    const { from, to } = getThisMonth()

    onChange([from, to])
  }

  return (
    <div className={style.buttonsContainer}>
      {showTodayButton && (
        <div className={style.presetButton} onClick={onSetToday}>
          Today
        </div>
      )}
      {showYesterdayButton && (
        <div className={style.presetButton} onClick={onSetYesterday}>
          Yesterday
        </div>
      )}
      {showTwoDaysButton && (
        <div className={style.presetButton} onClick={onSetTwoDaysAgo}>
          2 days ago
        </div>
      )}
      {showThisWeekButton && (
        <div className={style.presetButton} onClick={onSetThisWeek}>
          This week
        </div>
      )}
      {showThisMonthButton && (
        <div className={style.presetButton} onClick={onSetThisMonth}>
          This month
        </div>
      )}
    </div>
  )
}
