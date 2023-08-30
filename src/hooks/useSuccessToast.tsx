import { useToast } from "@chakra-ui/react"

export const useSuccessToast = () => {
  const toast = useToast({ containerStyle: { marginRight: "12px" } })

  return (description: string) =>
    toast({
      duration: 4500,
      title: "Success",
      status: "success",
      position: "top-right",
      isClosable: true,
      description: description || "Success"
    })
}
