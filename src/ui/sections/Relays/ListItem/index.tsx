import { useDisclosure } from "@chakra-ui/react"

import { ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import style from "./style.module.scss"

import type { RelayPayloadTemplateAttributes } from "@/app/database/interfaces/relay-payload-template.interface"
import type { NextPage } from "next"

interface Props {
  relay: RelayPayloadTemplateAttributes
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
}

export const RelaysTempolateListItem: NextPage<Props> = ({ relay, onDelete, onDuplicate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <ModalWindow
        header="Delete relay template"
        text={`Are you sure you want to delete '${relay.title}'`}
        onConfirmHandler={() => onDelete(relay.id)}
        isOpen={isOpen}
        onClose={onClose}
      />

      <div className={style.linkWrapper}>
        <div>
          <SideMenu.LinkText content={relay.title} />
        </div>
        <ContextButton
          menu={[
            { title: "Duplicate", onClick: () => onDuplicate(relay.id) },
            { title: "Delete", onClick: onOpen }
          ]}
        />
      </div>
    </>
  )
}
