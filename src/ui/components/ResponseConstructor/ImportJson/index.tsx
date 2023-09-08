import { useState } from "react"
import JSONInput from "react-json-editor-ajrm"
// @ts-ignore
import locale from "react-json-editor-ajrm/locale/en"

import { ControlButton } from "../ControlButton"

import style from "./style.module.scss"

import type { FC } from "react"

interface OnChangeProps {
  error: boolean
  jsObject: unknown
  json: string
}

interface Props {
  onImport: (data: unknown) => void
}

const font = { fontSize: "15px", lineHeight: "20px", fontFamily: "Roboto" }
const PLACEHOLDER = { success: true }

export const ImportJson: FC<Props> = ({ onImport }) => {
  const [object, setObject] = useState<unknown>(PLACEHOLDER)
  const [isValid, setIsValid] = useState(true)

  const onChange = (response: OnChangeProps) => {
    setIsValid(!response.error)
    setObject(response.jsObject)
  }

  const onImporthandler = () => {
    onImport(object)
  }

  return (
    <div className={style.importJSON}>
      <div>
        <JSONInput
          locale={locale}
          theme="dark_vscode_tribute"
          width="100%"
          height="350px"
          style={{
            body: { ...font, backgroundColor: "#432c82" },
            errorMessage: { ...font, backgroundColor: "#432c82" },
            warningBox: { backgroundColor: "#432c82" }
          }}
          placeholder={PLACEHOLDER}
          onChange={onChange}
          onBlur={onChange}
        />
        <div className={style.importButton}>
          {isValid && <ControlButton title="Import" icon="plus" onClick={onImporthandler} />}
        </div>
      </div>
    </div>
  )
}
