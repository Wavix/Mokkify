import { Card, MethodBadge, KeyValueList } from "@/ui/components"

import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  log: LogAttributes
}

export const RelayDetails: FC<Props> = ({ log }) => {
  if (!log.relay_method) return null

  return (
    <Card.Container noPadding gutterTop>
      <Card.Header>Relay Details</Card.Header>
      <KeyValueList.Container ratio="thirtySeventy">
        <KeyValueList.Row>
          <KeyValueList.Column>
            <MethodBadge method={log.relay_method} />
          </KeyValueList.Column>
          <KeyValueList.Column>
            <a href={log.relay_url} target="_blank">
              {log.relay_url}
            </a>
          </KeyValueList.Column>
        </KeyValueList.Row>

        <KeyValueList.Row>
          <KeyValueList.Column>Code</KeyValueList.Column>
          <KeyValueList.Column>{log.relay_response_code}</KeyValueList.Column>
        </KeyValueList.Row>
      </KeyValueList.Container>
    </Card.Container>
  )
}
