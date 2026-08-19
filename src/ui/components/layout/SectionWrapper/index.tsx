import type { FC, JSX, ReactNode } from "react"

interface Props {
  children: ReactNode
  title: string
  description?: string | null | JSX.Element
}

export const SectionWrapper: FC<Props> = ({ title, description, children }) => {
  return (
    <div className="flex min-h-full flex-auto flex-col p-4 pt-7">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
      <div className="text-muted-foreground min-h-[20px] pt-0.5 text-[13px]">{description}</div>
      <div className="flex-1 pt-5">{children}</div>
    </div>
  )
}
