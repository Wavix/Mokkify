import classNames from "classnames"

import { TableHeader } from "./Header"
import style from "./style.module.scss"

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
    <table className={style.table}>
      <TableHeader columns={columns} />
      <tbody className={style.container}>{children}</tbody>
    </table>
  )
}

const Row: FC<RowProps> = ({ isActive, children, onClick }) => (
  <tr className={classNames(style.row, { [style.pointer]: !!onClick, [style.active]: isActive })} onClick={onClick}>
    {children}
  </tr>
)
const Column: FC<ChildrenProps> = ({ children }) => <td className={style.column}>{children}</td>

const Cap: FC<CapProps> = ({ text }) => (
  <tr className={style.capWrapper}>
    <td>{text || "No data to display"}</td>
  </tr>
)

export const Table = {
  Container,
  Row,
  Column,
  Cap
}
