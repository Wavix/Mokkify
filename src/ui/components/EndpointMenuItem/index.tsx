import { useDisclosure } from "@chakra-ui/react"

import { MethodBadge, ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import style from "./style.module.scss"

import type { EndpointWithResponse } from "@/app/database/interfaces/endpoint.interface"
import type { NextPage } from "next"

interface Props {
  endpoint: EndpointWithResponse
  onEdit?: () => void
  onFlushLogs?: (id: number) => void
  onDelete?: (id: number) => void
}

export const EndpointMenuItem: NextPage<Props> = ({ endpoint, onEdit, onFlushLogs, onDelete }) => {
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
  const { isOpen: isOpenFlushLogs, onOpen: onOpenFlushLogs, onClose: onCloseFlushLogs } = useDisclosure()

  const getTemplateName = (): string => {
    if (endpoint.is_multiple_templates) return "Multiple templates"
    return endpoint.response?.title || "No template"
  }

  return (
    <>
      {onDelete && (
        <ModalWindow
          header="Delete endpoint"
          text={`Are you sure you want to delete '${endpoint.title}'`}
          onConfirmHandler={() => onDelete(endpoint.id)}
          isOpen={isOpenDelete}
          onClose={onCloseDelete}
        />
      )}

      {onFlushLogs && (
        <ModalWindow
          header="Flush endpoint logs"
          text={`Are you sure you want to flush logs for '${endpoint.title}'`}
          onConfirmHandler={() => onFlushLogs(endpoint.id)}
          isOpen={isOpenFlushLogs}
          onClose={onCloseFlushLogs}
        />
      )}

      <div className={style.linkWrapper}>
        <MethodBadge method={endpoint.method} />
        <div>
          <SideMenu.LinkText content={endpoint.title} />
          <SideMenu.LinkDescription content={getTemplateName()} />
        </div>
        {onEdit && onDelete && (
          <ContextButton
            menu={[
              { title: "Edit", onClick: onEdit },
              { title: "Flush logs", onClick: onOpenFlushLogs },
              { title: "Delete", onClick: onOpenDelete }
            ]}
          />
        )}
      </div>
    </>
  )
}
