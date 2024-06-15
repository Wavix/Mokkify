import { useEffect, useState, type FC } from "react"

import { Tooltip } from "@chakra-ui/react"

import { MethodBadge } from "../MethodBadge"

import { useSuccessToast } from "@/hooks/useSuccessToast"

import { CopyIcon } from "./icon"
import style from "./style.module.scss"

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
    <div className={style.endpointHref}>
      <MethodBadge method={method} />
      <a href={href} onClick={onClick}>
        {baseUrl}
        {href}
      </a>
      <div className={style.copyIcon} onClick={copyEndpoint}>
        <Tooltip label="Copy to clipboard" hasArrow>
          <div>
            <CopyIcon />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
