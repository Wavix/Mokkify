import type { Columns } from "../table.interfaces"
import type { FC } from "react"

export const TableHeader: FC<{ columns: Columns }> = ({ columns }) => {
  return (
    <thead>
      <tr className="border-border border-b">
        {Object.keys(columns).map(key => (
          <th key={key} className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
            {columns[key]}
          </th>
        ))}
      </tr>
    </thead>
  )
}
