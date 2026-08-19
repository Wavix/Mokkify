import { toast } from "sonner"

export const useSuccessToast = () => {
  return (description: string) =>
    toast.success("Success", {
      duration: 4500,
      description: description || "Success"
    })
}
