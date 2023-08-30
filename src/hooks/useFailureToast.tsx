import { useToast } from "@chakra-ui/react"

export const useFailureToast = () => {
  const toast = useToast({ containerStyle: { marginRight: "12px" } })

  return (description: string) =>
    toast({
      duration: 4500,
      title: "Error",
      description: description || "Request failed",
      status: "error",
      position: "top-right",
      isClosable: true
    })
}
