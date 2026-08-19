import { HintLabel } from "../HintLabel"

import { Switch as UISwitch } from "@/components/ui/switch"


import type { FC } from "react"

interface Props {
  title: string
  hint?: string
  defaultChecked?: boolean
  isChecked?: boolean
  onChange?: (checked: boolean) => void
}

export const Switch: FC<Props> = ({ title, hint, defaultChecked, isChecked, onChange }) => {
  return (
    <div>
      <HintLabel value={title} hint={hint} />
      <div className="pt-1">
        <UISwitch
          defaultChecked={defaultChecked}
          checked={isChecked}
          onCheckedChange={checked => (onChange ? onChange(checked) : undefined)}
        />
      </div>
    </div>
  )
}
