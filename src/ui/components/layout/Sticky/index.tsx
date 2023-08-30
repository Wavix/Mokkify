import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Sticky: FC<Props> = ({ children }) => {
  return (
    <div className={style.sticky}>
      <div className={style.container}>{children}</div>
    </div>
  )
}
