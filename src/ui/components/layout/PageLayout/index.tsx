import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const PageLayout: FC<Props> = ({ children }) => {
  return <div className={style.pageLayout}>{children}</div>
}
