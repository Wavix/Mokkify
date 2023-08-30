import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  title: string
  children: ReactNode
}

export const CategoryBlock: FC<Props> = ({ title, children }) => {
  return (
    <div className={style.categoryBlock}>
      <div className={style.title}>{title}</div>
      <div className={style.content}>{children}</div>
    </div>
  )
}
