import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const PageLayout: FC<Props> = ({ children }) => {
  return <div className="bg-muted/40 flex min-h-full w-full">{children}</div>
}
