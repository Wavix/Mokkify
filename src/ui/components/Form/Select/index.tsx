import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"

import { HintLabel } from "../HintLabel"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"


import type { FC } from "react"

type OptionValue = string | number | null | boolean

interface Option {
  label: string
  value: OptionValue
}

export type Value = OptionValue | undefined
type MultiValue = Array<Value>

interface Props {
  title?: string
  hint?: string
  value: Value | MultiValue
  isMulti?: boolean
  disabled?: boolean
  options: Array<Option>
  onChange?: (value: Value) => void
  onChangeMulti?: (value: MultiValue) => void
}

const SingleSelect: FC<Props> = ({ value, options, disabled, onChange }) => {
  const selectedIndex = options.findIndex(option => option.value === value)

  return (
    <UISelect
      value={selectedIndex >= 0 ? String(selectedIndex) : undefined}
      disabled={disabled}
      onValueChange={index => onChange && onChange(options[Number(index)]?.value)}
    >
      <SelectTrigger className="bg-background w-full" data-id="select.trigger">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => (
          <SelectItem key={`${option.label}-${index}`} value={String(index)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UISelect>
  )
}

const MultiSelect: FC<Props> = ({ value, options, disabled, onChangeMulti }) => {
  const [isOpen, setOpen] = useState(false)

  const selectedValues = (value as MultiValue) || []
  const selectedLabels = options.filter(option => selectedValues.includes(option.value)).map(option => option.label)

  const toggleValue = (optionValue: OptionValue) => {
    if (!onChangeMulti) return
    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter(item => item !== optionValue)
      : [...selectedValues, optionValue]
    onChangeMulti(next)
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-id="select.multiTrigger"
          className="bg-background w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedLabels.length ? (
              selectedLabels.join(", ")
            ) : (
              <span className="text-muted-foreground">Select...</span>
            )}
          </span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>Nothing found</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem key={`${option.label}-${index}`} onSelect={() => toggleValue(option.value)}>
                  <Check
                    className={cn("size-4", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const Select: FC<Props> = props => {
  const { title, hint, isMulti } = props

  return (
    <div>
      {title && <HintLabel value={title} hint={hint} />}
      {isMulti ? <MultiSelect {...props} /> : <SingleSelect {...props} />}
    </div>
  )
}
