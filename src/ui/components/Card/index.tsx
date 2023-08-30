import classNames from "classnames"
import React from "react"

import style from "./style.module.scss"

import type { ReactNode, FC } from "react"

interface ContainerProps {
  children: ReactNode
  noPadding?: boolean
  gutterTop?: boolean
}

interface HeaderProps {
  children: ReactNode
}

interface ActionsProps {
  children: ReactNode
}

const Container: FC<ContainerProps> = ({ noPadding, gutterTop, children }) => {
  return (
    <div className={classNames(style.card, { [style.noPadding]: noPadding, [style.topMargin]: gutterTop })}>
      {children}
    </div>
  )
}

const Header: FC<HeaderProps> = ({ children }) => <h3 className={style.header}>{children}</h3>

const Actions: FC<ActionsProps> = ({ children }) => <div className={style.actions}>{children}</div>

export const Card = {
  Header,
  Container,
  Actions
}
