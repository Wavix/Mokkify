import { useState } from "react"

import { ControlButton } from "../ControlButton"

import { Textarea } from "@/components/ui/textarea"


import type { FC } from "react"

interface Props {
  onImport: (data: unknown) => void
}

const PLACEHOLDER = `
{
  "success": true
}
`

export const ImportJson: FC<Props> = ({ onImport }) => {
  const [object, setObject] = useState<unknown>(JSON.parse(PLACEHOLDER))
  const [value, setValue] = useState<string>(PLACEHOLDER)

  const [error, setError] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)

    try {
      const json = JSON.parse(e.target.value)
      setError(null)
      setObject(json)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const onImporthandler = () => {
    onImport(object)
  }

  return (
    <div>
      <Textarea
        value={value}
        data-id="importJson.textarea"
        className="bg-background h-[400px] font-mono text-sm"
        onChange={onChange}
      />
      {error && <span className="text-destructive text-sm">{error}</span>}
      <div className="mt-5 flex justify-end">
        {!error && <ControlButton title="Import" icon="plus" onClick={onImporthandler} />}
      </div>
    </div>
  )
}
