import React from "react"

import { getYesterday, getToday, getTwoDaysAgo, getThisWeek, getThisMonth } from "../helpers"

import { Button } from "@/components/ui/button"


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
    <div className="flex flex-col gap-1">
      {showTodayButton && (
        <Button variant="ghost" size="sm" className="justify-start" data-id="datePreset.today" onClick={onSetToday}>
          Today
        </Button>
      )}
      {showYesterdayButton && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          data-id="datePreset.yesterday"
          onClick={onSetYesterday}
        >
          Yesterday
        </Button>
      )}
      {showTwoDaysButton && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          data-id="datePreset.twoDaysAgo"
          onClick={onSetTwoDaysAgo}
        >
          2 days ago
        </Button>
      )}
      {showThisWeekButton && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          data-id="datePreset.thisWeek"
          onClick={onSetThisWeek}
        >
          This week
        </Button>
      )}
      {showThisMonthButton && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          data-id="datePreset.thisMonth"
          onClick={onSetThisMonth}
        >
          This month
        </Button>
      )}
    </div>
  )
}
