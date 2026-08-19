import { Copy } from "lucide-react"
import { useEffect, useState, type FC } from "react"

import { MethodBadge } from "../MethodBadge"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSuccessToast } from "@/hooks/useSuccessToast"


import type { Method } from "@/app/database/interfaces/endpoint.interface"

interface Props {
  method: Method
  href: string
}

export const EndpointHref: FC<Props> = ({ method, href }) => {
  const successToast = useSuccessToast()

  const [baseUrl, setBaseUrl] = useState<string>("")
  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
  }

  useEffect(() => {
    setBaseUrl(`${window.location.protocol}//${window.location.host}/api`)
  }, [])

  const copyEndpoint = async () => {
    navigator.clipboard.writeText(`${baseUrl}${href}`)
    successToast("Endpoint copied to clipboard")
  }

  return (
    <div className="grid max-w-fit grid-cols-[auto_auto_20px] items-center gap-x-2.5">
      <MethodBadge method={method} />
      <a href={href} className="text-primary text-sm underline underline-offset-2 hover:no-underline" onClick={onClick}>
        {baseUrl}
        {href}
      </a>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-id="endpointHref.copy"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={copyEndpoint}
          >
            <Copy className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
    </div>
  )
}
