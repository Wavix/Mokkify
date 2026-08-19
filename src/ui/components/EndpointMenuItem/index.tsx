import { useState } from "react"

import { MethodBadge, ContextButton, ModalWindow, SideMenu } from "@/ui/components"

import type { EndpointAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { NextPage } from "next"

interface Props {
  endpoint: EndpointAttributes
  onEdit?: () => void
  onDuplicate?: (id: number) => void
  onFlushLogs?: (id: number) => void
  onDelete?: (id: number) => void
}

export const EndpointMenuItem: NextPage<Props> = ({ endpoint, onEdit, onDuplicate, onFlushLogs, onDelete }) => {
  const [isOpenDelete, setOpenDelete] = useState(false)
  const [isOpenFlushLogs, setOpenFlushLogs] = useState(false)

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
          onClose={() => setOpenDelete(false)}
        />
      )}

      {onFlushLogs && (
        <ModalWindow
          header="Flush endpoint logs"
          text={`Are you sure you want to flush logs for '${endpoint.title}'`}
          onConfirmHandler={() => onFlushLogs(endpoint.id)}
          isOpen={isOpenFlushLogs}
          onClose={() => setOpenFlushLogs(false)}
        />
      )}

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3">
        <MethodBadge method={endpoint.method} />
        <div className="min-w-0">
          <SideMenu.LinkText content={endpoint.title} />
          <SideMenu.LinkDescription content={getTemplateName()} />
        </div>
        {onEdit && onDelete && (
          <ContextButton
            menu={[
              { title: "Edit", onClick: onEdit },
              ...(onDuplicate ? [{ title: "Duplicate", onClick: () => onDuplicate(endpoint.id) }] : []),
              { title: "Flush logs", onClick: () => setOpenFlushLogs(true) },
              { title: "Delete", onClick: () => setOpenDelete(true) }
            ]}
          />
        )}
      </div>
    </>
  )
}
