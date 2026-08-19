import { Plus, Search } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton as UISkeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Logo } from "@/ui/components"

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
  return <div className="px-4">{children}</div>
}

const Link: FC<LinkProps> = ({ isActive, onClick, children }) => {
  return (
    <div
      className={cn(
        "mx-2 mb-0.5 cursor-pointer rounded-lg py-2.5 transition-colors select-none",
        "hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent"
      )}
      onClick={onClick}
    >
      <div className="px-2">{children}</div>
    </div>
  )
}

const LinkText: FC<BasicInlineProps> = ({ content }) => (
  <div className="text-sidebar-foreground text-[15px] font-medium">{content}</div>
)
const LinkDescription: FC<BasicInlineProps> = ({ content }) => (
  <div className="text-muted-foreground text-[13px]">{content}</div>
)

const Nav: FC<BasicProps> = ({ children }) => {
  return <div className="h-[calc(100vh-150px)] overflow-y-auto">{children}</div>
}

const Body: FC<BodyProps> = ({ header, onNew, onSearch, children }) => {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (onSearch) onSearch(search)
  }, [search])

  return (
    <div className="min-w-[310px]">
      <div className="bg-sidebar border-sidebar-border fixed top-0 inline-flex h-full w-[310px] flex-col border-r pt-8">
        <Container>
          <div className="text-sidebar-foreground pt-2 pb-12">
            <Logo />
          </div>
          {header && (
            <div className="flex items-center gap-2.5 pb-3.5">
              <div className="text-sidebar-foreground text-xl font-semibold tracking-tight">{header}</div>
              {onSearch && (
                <div className="relative ml-auto flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
                  <Input
                    value={search}
                    placeholder="Search"
                    className="h-8 pl-7 text-sm"
                    data-id="sideMenu.search"
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              )}
              {onNew && (
                <Button size="icon" className="size-8 shrink-0" data-id="sideMenu.new" onClick={onNew}>
                  <Plus />
                </Button>
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
      <div className="flex flex-col gap-2">
        {Array(4)
          .fill(Number)
          .map((_, index) => (
            <UISkeleton key={index} className="h-10 w-full" />
          ))}
      </div>
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
