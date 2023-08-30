import { Select as ChakraSelect } from "@chakra-ui/react"

import { HintLabel } from "../HintLabel"

import type { FC, ReactNode } from "react"

interface Props {
  title: string
  hint?: string
  value?: string | number
  defaultValue?: string | number
  isRequired?: boolean
  children: ReactNode
  onChange?: (value: string) => void
}

export const Select: FC<Props> = ({ title, hint, defaultValue, value, children, isRequired, onChange }) => {
  return (
    <div>
      <HintLabel value={title} hint={hint} />
      <ChakraSelect
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        focusBorderColor="purple.400"
        isRequired={isRequired}
        color="black"
      >
        {children}
      </ChakraSelect>
    </div>
  )
}
