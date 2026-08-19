import type { CSSProperties, FC, ReactNode } from "react"

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

const RATIO_COLUMNS: Record<Ratio, string> = {
  tenNinety: "10% 1fr",
  twentyEighty: "20% 1fr",
  thirtySeventy: "30% 1fr",
  fortySixty: "40% 1fr",
  fiftyFifty: "50% 1fr",
  sixtyForty: "60% 1fr",
  seventyThirty: "70% 1fr",
  eightyTwenty: "80% 1fr",
  ninetyTen: "90% 1fr"
}

const Container: FC<Props> = ({ ratio, children }) => {
  const styleVars = { "--kv-cols": RATIO_COLUMNS[ratio || "thirtySeventy"] } as CSSProperties

  return (
    <div style={styleVars}>
      <div className="overflow-hidden rounded-lg">{children}</div>
    </div>
  )
}

const Row: FC<Props> = ({ children }) => {
  return <div className="odd:bg-muted/60 grid [grid-template-columns:var(--kv-cols,30%_1fr)]">{children}</div>
}

const Column: FC<Props> = ({ children }) => (
  <div className="min-h-[25px] self-center overflow-y-auto py-1.5 pl-5 text-sm leading-tight first:font-medium [&:nth-child(2n)]:pr-5 [&:nth-child(2n)]:pl-0">
    {children}
  </div>
)

export const KeyValueList = {
  Container,
  Row,
  Column
}
