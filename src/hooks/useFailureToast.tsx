import { toast } from "sonner"

export const useFailureToast = () => {
  return (description: string) =>
    toast.error("Error", {
      duration: 4500,
      description: description || "Request failed"
    })
}
