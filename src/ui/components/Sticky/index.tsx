import type { FC, ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Sticky: FC<Props> = ({ children }) => {
  return (
    <div className="h-full">
      <div className="sticky top-1">{children}</div>
    </div>
  )
}
