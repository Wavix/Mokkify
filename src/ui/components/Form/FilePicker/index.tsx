import { Upload } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"

import type { FC } from "react"

interface Props {
  accept?: string
  dataId?: string
  onChange: (file: File | null) => void
}

export const FilePicker: FC<Props> = ({ accept, dataId, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFileName(file?.name || null)
    onChange(file)
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        data-id={dataId || "filePicker.choose"}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        Choose file
      </Button>
      <span className="text-muted-foreground truncate text-[13px]">{fileName || "No file chosen"}</span>
      <input ref={inputRef} type="file" hidden accept={accept} onChange={onFileChange} />
    </div>
  )
}
