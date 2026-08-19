import { cn } from "@/lib/utils"

import type { ReactNode, FC } from "react"

interface ContainerProps {
  children: ReactNode
  noPadding?: boolean
  gutterTop?: boolean
}

interface HeaderProps {
  children: ReactNode
}

interface ActionsProps {
  children: ReactNode
}

const Container: FC<ContainerProps> = ({ noPadding, gutterTop, children }) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border/60 rounded-xl border p-5 shadow-xs",
        noPadding && "p-0 pb-2.5 [&>h3]:px-5 [&>h3]:pt-5",
        gutterTop && "mt-[14px]"
      )}
    >
      {children}
    </div>
  )
}

const Header: FC<HeaderProps> = ({ children }) => (
  <h3 className="text-primary mb-4 text-sm font-semibold tracking-wide uppercase">{children}</h3>
)

const Actions: FC<ActionsProps> = ({ children }) => (
  <div className="flex justify-end gap-2 pt-3 [&:not(:first-child)]:mt-7">{children}</div>
)

export const Card = {
  Header,
  Container,
  Actions
}
