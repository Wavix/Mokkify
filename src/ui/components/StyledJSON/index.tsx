import "react18-json-view/src/style.css"
import React from "react"
import DynamicReactJson from "react18-json-view"

import style from "./style.module.scss"

interface Props {
  data: unknown
}

export const StyledJSON: React.FC<Props> = ({ data }) => {
  return (
    <div className={style.jsonView}>
      {data ? <DynamicReactJson src={data} /> : <div className={style.cap}>No data available</div>}
    </div>
  )
}
