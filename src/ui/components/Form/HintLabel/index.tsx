import { QuestionOutlineIcon } from "@chakra-ui/icons"
import { Tooltip } from "@chakra-ui/react"

import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  value: string
  hint?: string
}

export const HintLabel: FC<Props> = ({ value, hint }) => {
  return (
    <div className={style.hintLabel}>
      <div>{value}</div>
      {hint && (
        <div className={style.infoWrapper}>
          <Tooltip hasArrow label={hint} bg="black" color="white" fontSize={12} fontWeight={400} maxWidth={250}>
            <QuestionOutlineIcon color="gray.500" />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
