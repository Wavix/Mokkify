import { HintLabel } from "../HintLabel"

import { Input as UIInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { FC } from "react"

interface Props {
  title?: string
  hint?: string
  value?: string | number
  type?: string
  readOnly?: boolean
  disabled?: boolean
  placeholder?: string
  isRequired?: boolean
  onChange?: (value: string) => void
}

export const Input: FC<Props> = ({
  title,
  hint,
  value,
  type,
  placeholder,
  readOnly,
  disabled,
  isRequired,
  onChange
}) => {
  return (
    <div>
      {title && <HintLabel value={title} hint={hint} />}
      <UIInput
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        value={value}
        className={cn("bg-background", readOnly && "bg-muted")}
        type={type || "text"}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        required={isRequired}
      />
    </div>
  )
}
