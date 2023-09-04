import classNames from "classnames"
import { useState, useEffect } from "react"

import { Skeleton as ChakraSkeleton, Stack } from "@chakra-ui/react"

import { Logo } from "@/ui/components"

import { NewIcon } from "./NewIcon"
import style from "./style.module.scss"

import type { FC, ReactNode } from "react"

interface BodyProps {
  children: ReactNode
  header?: string
  onNew?: () => void
  onSearch?: (value: string) => void
}

interface LinkProps {
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
}

interface BasicProps {
  children: ReactNode
}

interface BasicInlineProps {
  content: string
}

const Container: FC<BasicProps> = ({ children }) => {
  return <div className={style.sideMenuContainer}>{children}</div>
}

const Link: FC<LinkProps> = ({ isActive, onClick, children }) => {
  return (
    <div className={classNames(style.sideMenuLink, { [style.active]: isActive })} onClick={onClick}>
      <Container>{children}</Container>
    </div>
  )
}

const LinkText: FC<BasicInlineProps> = ({ content }) => <div className={style.linkTitle}>{content}</div>
const LinkDescription: FC<BasicInlineProps> = ({ content }) => <div className={style.linkDescription}>{content}</div>

const Nav: FC<BasicProps> = ({ children }) => {
  return <div className={style.sideMenuNav}>{children}</div>
}

const Body: FC<BodyProps> = ({ header, onNew, onSearch, children }) => {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (onSearch) onSearch(search)
  }, [search])

  return (
    <div className={style.sideMenu}>
      <div className={style.sideMenuWrapper}>
        <Container>
          <div className={style.sideMenuLogoWrapper}>
            <Logo />
          </div>
          {header && (
            <div className={style.sideMenuHeader}>
              <div>{header}</div>
              {onSearch && (
                <div>
                  <input value={search} placeholder="Search" onChange={e => setSearch(e.target.value)} />
                </div>
              )}
              {onNew && (
                <div className={style.new} onClick={onNew}>
                  <NewIcon />
                </div>
              )}
            </div>
          )}
        </Container>
        {children}
      </div>
    </div>
  )
}

const Skeleton = () => {
  return (
    <Container>
      <Stack>
        {Array(4)
          .fill(Number)
          .map((_, index) => (
            <ChakraSkeleton key={index} height="40px" startColor="purple.600" endColor="purple.400" />
          ))}
      </Stack>
    </Container>
  )
}

export const SideMenu = {
  Body,
  Container,
  Nav,
  Link,
  LinkText,
  LinkDescription,
  Skeleton
}
