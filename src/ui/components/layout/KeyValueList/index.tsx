import classNames from "classnames"

import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

type Ratio =
  | "tenNinety"
  | "twentyEighty"
  | "thirtySeventy"
  | "fortySixty"
  | "fiftyFifty"
  | "sixtyForty"
  | "seventyThirty"
  | "eightyTwenty"
  | "ninetyTen"

interface Props {
  children: ReactNode
  ratio?: Ratio
}

const Container: FC<Props> = ({ ratio, children }) => {
  return (
    <div
      className={classNames(style.keyValueList, {
        [style.tenNinety]: ratio === "tenNinety",
        [style.twentyEighty]: ratio === "twentyEighty",
        [style.thirtySeventy]: ratio === "thirtySeventy",
        [style.fortySixty]: ratio === "fortySixty",
        [style.fiftyFifty]: ratio === "fiftyFifty",
        [style.sixtyForty]: ratio === "sixtyForty",
        [style.seventyThirty]: ratio === "seventyThirty",
        [style.eightyTwenty]: ratio === "eightyTwenty",
        [style.ninetyTen]: ratio === "ninetyTen"
      })}
    >
      <div>{children}</div>
    </div>
  )
}

const Row: FC<Props> = ({ children }) => {
  return <div className={style.keyValueListRow}>{children}</div>
}

const Column: FC<Props> = ({ children }) => <div className={style.column}>{children}</div>

export const KeyValueList = {
  Container,
  Row,
  Column
}
