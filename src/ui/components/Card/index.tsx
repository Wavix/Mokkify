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
        "bg-card text-card-foreground border-border rounded-xl border p-5 shadow-xs",
        noPadding && "p-0 pb-2 [&>h3]:px-5 [&>h3]:pt-4",
        gutterTop && "mt-[14px]"
      )}
    >
      {children}
    </div>
  )
}

const Header: FC<HeaderProps> = ({ children }) => (
  <h3 className="text-foreground mb-4 text-sm font-medium">{children}</h3>
)

const Actions: FC<ActionsProps> = ({ children }) => (
  <div className="flex justify-end gap-2 pt-2 [&:not(:first-child)]:mt-6">{children}</div>
)

export const Card = {
  Header,
  Container,
  Actions
}
