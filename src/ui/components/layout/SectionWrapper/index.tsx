import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
  title: string
  description?: string | null | JSX.Element
}

export const SectionWrapper: FC<Props> = ({ title, description, children }) => {
  return (
    <div className={style.sectionWrapper}>
      <div className={style.sectionHeader}>{title}</div>
      <div className={style.sectionDescription}>{description}</div>
      <div className={style.sectionContent}>{children}</div>
    </div>
  )
}
