import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/react"

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
    <>
      <Modal motionPreset="slideInBottom" size="md" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="black">{header}</ModalHeader>
          <ModalCloseButton variant="solid" colorScheme="red" />
          <ModalBody color="black">{text}</ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button color="white" onClick={onConfirm} variant="solid" colorScheme="cyan">
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
