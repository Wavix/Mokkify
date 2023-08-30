import { Sidebar, PageLayout } from "@/ui/components/layout"

import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const DefaultLayout: FC<Props> = ({ children }) => {
  return (
    <div className={style.mainLayout}>
      <Sidebar />
      <PageLayout>{children}</PageLayout>
    </div>
  )
}
