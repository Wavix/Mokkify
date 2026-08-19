import type { FC, ReactNode } from "react"

interface Props {
  title: string
  children: ReactNode
}

export const CategoryBlock: FC<Props> = ({ title, children }) => {
  return (
    <div className="[&:nth-last-of-type(2)>div:last-child]:pb-0">
      <div className="text-primary border-primary/50 border-b pb-0.5 text-[13px] font-medium uppercase">{title}</div>
      <div className="pt-2.5 pb-5">{children}</div>
    </div>
  )
}
