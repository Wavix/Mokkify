import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const BlockQuote: FC<Props> = ({ children }) => {
  return <blockquote className={style.blockQuote}>{children}</blockquote>
}
