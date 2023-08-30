import { Switch as ChakraSwitch } from "@chakra-ui/react"

import { HintLabel } from "../HintLabel"

import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  title: string
  hint?: string
  defaultChecked?: boolean
  isChecked?: boolean
  onChange?: (checked: boolean) => void
}

export const Switch: FC<Props> = ({ title, hint, defaultChecked, isChecked, onChange }) => {
  return (
    <div>
      <HintLabel value={title} hint={hint} />
      <div className={style.switchContainer}>
        <ChakraSwitch
          size="lg"
          colorScheme="purple"
          defaultChecked={defaultChecked}
          isChecked={isChecked}
          onChange={e => (onChange ? onChange(e.target.checked) : undefined)}
        />
      </div>
    </div>
  )
}
