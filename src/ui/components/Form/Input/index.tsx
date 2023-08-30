import { Input as ChakraInput } from "@chakra-ui/input"

import { HintLabel } from "../HintLabel"

import type { FC } from "react"

interface Props {
  title: string
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
      <HintLabel value={title} hint={hint} />
      <ChakraInput
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        value={value}
        color="black"
        focusBorderColor="purple.400"
        _placeholder={{ color: "grey" }}
        type={type || "text"}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        isRequired={isRequired}
      />
    </div>
  )
}
