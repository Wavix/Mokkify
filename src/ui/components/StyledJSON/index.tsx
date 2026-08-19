import "react18-json-view/src/style.css"
import "react18-json-view/src/dark.css"
import { useTheme } from "next-themes"
import React from "react"
import DynamicReactJson from "react18-json-view"

interface Props {
  data: unknown
}

export const StyledJSON: React.FC<Props> = ({ data }) => {
  const { resolvedTheme } = useTheme()

  return (
    <div className="[overflow-wrap:break-word] break-all">
      {data ? (
        <DynamicReactJson src={data} dark={resolvedTheme === "dark"} />
      ) : (
        <div className="text-muted-foreground text-sm">No data available</div>
      )}
    </div>
  )
}
