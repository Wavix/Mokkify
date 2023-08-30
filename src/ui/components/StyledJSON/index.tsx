import dynamic from "next/dynamic"
import React from "react"

interface Props {
  data: unknown
}

const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false })

export const StyledJSON: React.FC<Props> = ({ data }) => {
  return (
    <DynamicReactJson
      style={{ overflowWrap: "break-word", wordBreak: "break-all" }}
      src={data as any}
      displayDataTypes={false}
      displayObjectSize={false}
      iconStyle="square"
      sortKeys={false}
      name={null}
    />
  )
}
