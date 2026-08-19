import type { FC, ReactNode } from "react"

interface Props {
  title: string
  children: ReactNode
}

export const CategoryBlock: FC<Props> = ({ title, children }) => {
  return (
    <div className="[&:nth-last-of-type(2)>div:last-child]:pb-0">
      <div className="text-muted-foreground border-border border-b pb-1.5 text-[13px] font-medium">{title}</div>
      <div className="pt-3.5 pb-6">{children}</div>
    </div>
  )
}
