import dayjs from "dayjs"

import { config } from "@/config"
import { Card, MethodBadge, KeyValueList } from "@/ui/components"

import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  log: LogAttributes
}

export const MainDetails: FC<Props> = ({ log }) => {
  return (
    <Card.Container noPadding>
      <Card.Header>Request Details</Card.Header>
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
