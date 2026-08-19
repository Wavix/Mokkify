import type { FC, ReactNode } from "react"

export const BlockQuote: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <blockquote className="w-full rounded-md border-l-3 border-orange-500 bg-orange-100 p-3 text-sm text-orange-950 dark:bg-orange-500/15 dark:text-orange-100">
      {children}
    </blockquote>
  )
}
