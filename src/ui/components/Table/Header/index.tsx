import style from "./style.module.scss"

import type { Columns } from "../table.interfaces"
import type { FC } from "react"

interface Props {
  columns: Columns
}

export const TableHeader: FC<Props> = ({ columns }) => {
  return (
    <thead className={style.tableHeader}>
      <tr className={style.container}>
        {Object.keys(columns).map(key => (
          <th key={key} className={style.head}>
            {columns[key]}
          </th>
        ))}
      </tr>
    </thead>
  )
}
