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
        "mx-2 mb-0.5 cursor-pointer rounded-md px-2 py-2 transition-colors select-none",
        "hover:bg-sidebar-accent/60",
        isActive && "bg-sidebar-accent hover:bg-sidebar-accent"
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const LinkText: FC<BasicInlineProps> = ({ content }) => (
  <div className="text-sidebar-foreground truncate text-sm font-medium">{content}</div>
)
const LinkDescription: FC<BasicInlineProps> = ({ content }) => (
  <div className="text-muted-foreground truncate text-xs">{content}</div>
)

const Nav: FC<BasicProps> = ({ children }) => {
  return <div className="h-[calc(100vh-140px)] overflow-y-auto">{children}</div>
}

const Body: FC<BodyProps> = ({ header, onNew, onSearch, children }) => {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (onSearch) onSearch(search)
  }, [search])

  return (
    <div className="min-w-[310px]">
      <div className="bg-sidebar border-sidebar-border fixed top-0 inline-flex h-full w-[310px] flex-col border-r pt-6">
        <Container>
          <div className="text-sidebar-foreground pt-1 pb-8 [&_svg]:h-6 [&_svg]:w-auto">
            <Logo />
          </div>
          {header && (
            <div className="flex items-center gap-2 pb-3">
              <div className="text-sidebar-foreground text-[15px] font-semibold tracking-tight">{header}</div>
              {onSearch && (
                <div className="relative ml-auto flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
                  <Input
                    value={search}
                    placeholder="Search"
                    className="h-7 pl-7 text-[13px]"
                    data-id="sideMenu.search"
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              )}
              {onNew && (
                <Button size="icon" className="size-7 shrink-0" data-id="sideMenu.new" onClick={onNew}>
                  <Plus className="size-4" />
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
            <UISkeleton key={index} className="h-9 w-full" />
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
