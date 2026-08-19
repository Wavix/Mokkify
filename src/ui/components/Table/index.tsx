import { cn } from "@/lib/utils"

import { TableHeader } from "./Header"

import type { Columns } from "./table.interfaces"
import type { FC, ReactNode } from "react"

interface Props {
  columns: Columns
  children: ReactNode
}

interface RowProps {
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
}

interface CapProps {
  text?: string
}

interface ChildrenProps {
  children: ReactNode
}

const Container: FC<Props> = ({ columns, children }) => {
  return (
    <table className="w-full border-collapse">
      <TableHeader columns={columns} />
      <tbody>{children}</tbody>
    </table>
  )
}

const Row: FC<RowProps> = ({ isActive, children, onClick }) => (
  <tr
    className={cn(
      "border-border/60 hover:bg-muted/50 border-b transition-colors last:border-0",
      onClick && "cursor-pointer",
      isActive && "bg-primary/10 hover:bg-primary/10"
    )}
    onClick={onClick}
  >
    {children}
  </tr>
)
const Column: FC<ChildrenProps> = ({ children }) => (
  <td className="text-foreground/90 p-4 text-left align-middle text-sm whitespace-nowrap">{children}</td>
)

const Cap: FC<CapProps> = ({ text }) => (
  <tr>
    <td colSpan={99} className="text-muted-foreground h-14 p-4 text-center text-sm">
      {text || "No data to display"}
    </td>
  </tr>
)

export const Table = {
  Container,
  Row,
  Column,
  Cap
}
