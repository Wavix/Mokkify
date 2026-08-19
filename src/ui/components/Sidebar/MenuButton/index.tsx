import { useRouter } from "next/router"

import { cn } from "@/lib/utils"

import type { FC, JSX } from "react"

interface Props {
  icon: JSX.Element
  title: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export const MenuButton: FC<Props> = ({ icon, href, title, active, onClick }) => {
  const router = useRouter()

  const onClickHandler = () => {
    if (href) router.push(href, undefined, { shallow: true })
    if (onClick) onClick()
  }

  return (
    <button
      type="button"
      data-id={`sidebar.${title.toLowerCase()}`}
      className={cn(
        "group grid cursor-pointer justify-items-center gap-1 border-none bg-transparent pb-2.5",
        "text-rail-foreground hover:text-rail-accent-foreground",
        active && "text-rail-accent-foreground"
      )}
      onClick={onClickHandler}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-md transition-colors",
          "group-hover:bg-rail-accent/60",
          active && "bg-rail-accent group-hover:bg-rail-accent"
        )}
      >
        {icon}
      </span>
      <span className="text-[10px] leading-none font-medium select-none">{title}</span>
    </button>
  )
}
