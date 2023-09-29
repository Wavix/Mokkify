import { useState } from "react"

import { ControlButton } from "../ControlButton"

import style from "./style.module.scss"

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
    <div className={style.importJSON}>
      <div>
        <textarea value={value} onChange={onChange} />
        {error && <span className={style.error}>{error}</span>}
        <div className={style.importButton}>
          {!error && <ControlButton title="Import" icon="plus" onClick={onImporthandler} />}
        </div>
      </div>
    </div>
  )
}
