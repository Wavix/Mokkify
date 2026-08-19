import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

import type { FC } from "react"

interface Props {
  header?: string
  text: string
  onConfirmHandler: () => void
  isOpen: boolean
  onClose: () => void
}

export const ModalWindow: FC<Props> = ({ header, text, onConfirmHandler, isOpen, onClose }) => {
  const onConfirm = () => {
    onConfirmHandler()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{header}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-id="modal.close" onClick={onClose}>
            Close
          </AlertDialogCancel>
          <AlertDialogAction data-id="modal.confirm" onClick={onConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
