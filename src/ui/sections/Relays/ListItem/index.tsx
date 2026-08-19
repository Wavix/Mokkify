import { useState } from "react"

import { ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import type { RelayPayloadTemplateAttributes } from "@/app/database/interfaces/relay-payload-template.interface"
import type { NextPage } from "next"

interface Props {
  relay: RelayPayloadTemplateAttributes
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
}

export const RelaysTempolateListItem: NextPage<Props> = ({ relay, onDelete, onDuplicate }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <ModalWindow
        header="Delete relay template"
        text={`Are you sure you want to delete '${relay.title}'`}
        onConfirmHandler={() => onDelete(relay.id)}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      />

      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3">
        <div>
          <SideMenu.LinkText content={relay.title} />
        </div>
        <ContextButton
          menu={[
            { title: "Duplicate", onClick: () => onDuplicate(relay.id) },
            { title: "Delete", onClick: () => setOpen(true) }
          ]}
        />
      </div>
    </>
  )
}
