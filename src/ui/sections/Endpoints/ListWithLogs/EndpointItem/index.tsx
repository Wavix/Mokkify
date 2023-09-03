import { useDisclosure } from "@chakra-ui/react"

import { MethodBadge, ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import style from "./style.module.scss"

import type { EndpointWithResponse } from "@/app/database/interfaces/endpoint.interface"
import type { NextPage } from "next"

interface Props {
  endpoint: EndpointWithResponse
  onEdit: () => void
  onDelete: (id: number) => void
}

export const EndpointItem: NextPage<Props> = ({ endpoint, onEdit, onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const getTemplateName = (): string => {
    if (endpoint.is_multiple_templates) return "Multiple templates"
    return endpoint.response?.title || "No template"
  }

  return (
    <>
      <ModalWindow
        header="Delete endpoint"
        text={`Are you sure you want to delete '${endpoint.title}'`}
        onConfirmHandler={() => onDelete(endpoint.id)}
        isOpen={isOpen}
        onClose={onClose}
      />

      <div className={style.linkWrapper}>
        <MethodBadge method={endpoint.method} />
        <div>
          <SideMenu.LinkText content={endpoint.title} />
          <SideMenu.LinkDescription content={getTemplateName()} />
        </div>
        <ContextButton
          menu={[
            { title: "Edit", onClick: onEdit },
            { title: "Delete", onClick: onOpen }
          ]}
        />
      </div>
    </>
  )
}
