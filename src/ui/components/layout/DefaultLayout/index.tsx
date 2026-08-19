import { Sidebar } from "@/ui/components"
import { PageLayout } from "@/ui/components/layout"

import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const DefaultLayout: FC<Props> = ({ children }) => {
  return (
    <div className="min-h-full pl-[62px]">
      <Sidebar />
      <PageLayout>{children}</PageLayout>
    </div>
  )
}
