import { useState } from "react"

import { ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import type { ResponseTemplateAttributes } from "@/app/database/interfaces/response-template.interface"
import type { NextPage } from "next"

interface Props {
  template: ResponseTemplateAttributes
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
}

export const TemplateListItem: NextPage<Props> = ({ template, onDelete, onDuplicate }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <ModalWindow
        header="Delete template"
        text={`Are you sure you want to delete '${template.title}'`}
        onConfirmHandler={() => onDelete(template.id)}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      />

      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3">
        <div>
          <SideMenu.LinkText content={template.title} />
        </div>
        <ContextButton
          menu={[
            { title: "Duplicate", onClick: () => onDuplicate(template.id) },
            { title: "Delete", onClick: () => setOpen(true) }
          ]}
        />
      </div>
    </>
  )
}
