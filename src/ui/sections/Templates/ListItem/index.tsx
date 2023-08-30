import { useDisclosure } from "@chakra-ui/react"

import { ContextButton, ModalWindow } from "@/ui/components"
import { SideMenu } from "@/ui/components/layout"

import style from "./style.module.scss"

import type { ResponseTemplateAttributes } from "@/app/database/interfaces/response-template.interface"
import type { NextPage } from "next"

interface Props {
  template: ResponseTemplateAttributes
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
}

export const TemplateListItem: NextPage<Props> = ({ template, onDelete, onDuplicate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <ModalWindow
        header="Delete template"
        text={`Are you sure you want to delete '${template.title}'`}
        onConfirmHandler={() => onDelete(template.id)}
        isOpen={isOpen}
        onClose={onClose}
      />

      <div className={style.linkWrapper}>
        <div>
          <SideMenu.LinkText content={template.title} />
        </div>
        <ContextButton
          menu={[
            { title: "Duplicate", onClick: () => onDuplicate(template.id) },
            { title: "Delete", onClick: onOpen }
          ]}
        />
      </div>
    </>
  )
}
