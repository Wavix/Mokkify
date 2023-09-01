import { SectionWrapper } from "@/ui/components/layout"

import { Robot } from "./Robot"
import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  title: string
  description: string
}

export const Cap: FC<Props> = ({ title, description }) => {
  return (
    <>
      <title>Endpoints</title>
      <SectionWrapper title={title} description={description}>
        <div className={style.robotContainer}>
          <Robot />
        </div>
      </SectionWrapper>
    </>
  )
}
