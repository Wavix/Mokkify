import { SectionWrapper } from "@/ui/components/layout"

import { Robot } from "./Robot"
import style from "./style.module.scss"

import type { FC } from "react"

export const Cap: FC = () => {
  return (
    <>
      <title>Endpoints</title>
      <SectionWrapper title="Endpoints requests" description="Select endpoint to see the log">
        <div className={style.robotContainer}>
          <Robot />
        </div>
      </SectionWrapper>
    </>
  )
}
