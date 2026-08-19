import dayjs from "dayjs"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { PresetButtons } from "./PresetButtons"

import type { ButtonsVisible } from "./PresetButtons"
import type { FC } from "react"
import type { DateRange } from "react-day-picker"

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
  disabled?: boolean
}

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
  disabled
}) => {
  const [isOpen, setOpen] = useState(false)

  const onRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) setOpen(false)
    onChange({ from: range?.from || null, to: range?.to || null })
  }

  const onSingleSelect = (date: Date | undefined) => {
    setOpen(false)
    onChange({ from: null, to: null, date: date || null })
  }

  const onPresetSelect = (dates: [Date | null, Date | null]) => {
    const [from, to] = dates
    setOpen(false)
    onChange({ from, to })
  }

  const onReset = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange({ from: null, to: null })
  }

  const getLabel = (): string => {
    if (single && signleDate) return dayjs(signleDate).format("DD MMM, YYYY")
    if (single) return label
    if (!startDate) return label

    const dateDifference = dayjs(startDate).diff(dayjs(endDate))

    if (!dateDifference) return dayjs(startDate).format("DD MMM, YYYY")

    return [dayjs(startDate).format("DD MMM, YYYY"), endDate ? ` - ${dayjs(endDate).format("DD MMM, YYYY")}` : ""].join(
      ""
    )
  }

  const hasButtons = Object.values(buttonsVisible).some(item => item)
  const hasValue = single ? !!signleDate : !!startDate

  return (
    <div className={wrapperClassName}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            data-id="rangeDatePicker.trigger"
            className={cn("bg-background w-full justify-start font-normal", !hasValue && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4" />
            <span className="truncate">{getLabel()}</span>
            {hasValue && !noReset && (
              <span
                role="button"
                tabIndex={0}
                data-id="rangeDatePicker.reset"
                className="text-muted-foreground hover:text-foreground ml-auto cursor-pointer"
                onClick={onReset}
                onKeyDown={event => event.key === "Enter" && onReset(event as unknown as React.MouseEvent)}
              >
                <X className="size-4" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {single ? (
              <Calendar mode="single" selected={signleDate || undefined} onSelect={onSingleSelect} />
            ) : (
              <Calendar
                mode="range"
                selected={{ from: startDate || undefined, to: endDate || undefined }}
                onSelect={onRangeSelect}
              />
            )}
            {hasButtons && (
              <div className="border-border border-l p-2">
                <PresetButtons onChange={onPresetSelect} buttonsVisible={buttonsVisible} />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
