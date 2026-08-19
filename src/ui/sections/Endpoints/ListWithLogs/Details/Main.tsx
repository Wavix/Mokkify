import dayjs from "dayjs"
import { SquareTerminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { config } from "@/config"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import { Card, MethodBadge, KeyValueList } from "@/ui/components"

import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  log: LogAttributes
}

export const MainDetails: FC<Props> = ({ log }) => {
  const successToast = useSuccessToast()

  const buildCurl = (): string => {
    const parts = [`curl -X ${log.method} '${log.url}'`]

    const contentType = log.request_headers?.["content-type"]
    if (contentType) parts.push(`-H 'Content-Type: ${contentType}'`)

    const userAgent = log.user_agent
    if (userAgent) parts.push(`-H 'User-Agent: ${userAgent}'`)

    if (log.request_payload) parts.push(`-d '${JSON.stringify(log.request_payload).replaceAll("'", "'\\''")}'`)

    return parts.join(" \\\n  ")
  }

  const onCopyCurl = () => {
    navigator.clipboard.writeText(buildCurl())
    successToast("cURL command copied to clipboard")
  }

  return (
    <Card.Container noPadding>
      <div className="flex items-center justify-between px-5 pt-4">
        <h3 className="text-foreground mb-4 text-sm font-medium">Request Details</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mb-4 h-7 px-2.5 text-xs font-medium"
          data-id="logDetails.copyCurl"
          onClick={onCopyCurl}
        >
          <SquareTerminal className="size-3.5" />
          Copy as cURL
        </Button>
      </div>
      <KeyValueList.Container ratio="thirtySeventy">
        <KeyValueList.Row>
          <KeyValueList.Column>
            <MethodBadge method={log.method} />
          </KeyValueList.Column>
          <KeyValueList.Column>
            <a href={log.url} target="_blank">
              {log.url}
            </a>
          </KeyValueList.Column>
        </KeyValueList.Row>

        <KeyValueList.Row>
          <KeyValueList.Column>Host</KeyValueList.Column>
          <KeyValueList.Column>{log.request_ip}</KeyValueList.Column>
        </KeyValueList.Row>

        <KeyValueList.Row>
          <KeyValueList.Column>Date</KeyValueList.Column>
          <KeyValueList.Column>{dayjs(log.created_at).format(config.dateFormat)}</KeyValueList.Column>
        </KeyValueList.Row>

        <KeyValueList.Row>
          <KeyValueList.Column>Code</KeyValueList.Column>
          <KeyValueList.Column>{log.response_code}</KeyValueList.Column>
        </KeyValueList.Row>

        {log.template_name && (
          <KeyValueList.Row>
            <KeyValueList.Column>Response</KeyValueList.Column>
            <KeyValueList.Column>{log.template_name}</KeyValueList.Column>
          </KeyValueList.Row>
        )}
      </KeyValueList.Container>
    </Card.Container>
  )
}
