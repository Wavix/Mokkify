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

const NONE_VALUE = "__none__"

// Radix Select values must be non-empty strings; keep them derived from the
// option VALUE (not its index) so the selection stays stable while options load
const toKey = (value: OptionValue): string => (value === null ? NONE_VALUE : String(value))

const SingleSelect: FC<Props> = ({ value, options, disabled, onChange }) => {
  const hasMatch = options.some(option => option.value === value)
  // While options are still loading the current value has no matching item;
  // render a hidden ghost item for it so Radix never sees an unmatched
  // controlled value (that makes it fire a spurious onValueChange)
  const isTransient = !hasMatch && value !== null && value !== undefined
  const selectedKey = hasMatch || isTransient ? toKey(value as OptionValue) : ""

  const onValueChange = (key: string) => {
    if (!onChange || !key || key === selectedKey) return
    const option = options.find(item => toKey(item.value) === key)
    if (!option && key !== NONE_VALUE) return
    onChange(option ? option.value : null)
  }

  return (
    <UISelect value={selectedKey} disabled={disabled} onValueChange={onValueChange}>
      <SelectTrigger className="bg-background w-full" data-id="select.trigger">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {isTransient && (
          <SelectItem key="__transient__" value={toKey(value as OptionValue)} disabled className="hidden">
            ...
          </SelectItem>
        )}
        {options.map((option, index) => (
          <SelectItem key={`${option.label}-${index}`} value={toKey(option.value)}>
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
