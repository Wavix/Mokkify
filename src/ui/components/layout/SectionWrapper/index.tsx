import type { FC, JSX, ReactNode } from "react"

interface Props {
  children: ReactNode
  title: string
  description?: string | null | JSX.Element
}

export const SectionWrapper: FC<Props> = ({ title, description, children }) => {
  return (
    <div className="flex min-h-full flex-auto flex-col p-[14px] pt-8">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="text-muted-foreground min-h-[22px] text-sm">{description}</div>
      <div className="flex-1 pt-6">{children}</div>
    </div>
  )
}
