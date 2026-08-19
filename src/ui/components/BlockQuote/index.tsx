import type { FC, ReactNode } from "react"

export const BlockQuote: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <blockquote className="bg-muted/50 text-muted-foreground border-foreground/20 w-full rounded-md border-l-2 p-3 text-[13px]">
      {children}
    </blockquote>
  )
}
