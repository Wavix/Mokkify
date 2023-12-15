import { Card, KeyValueList } from "@/ui/components"

import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  log: LogAttributes
}

export const HeadersDetails: FC<Props> = ({ log }) => {
  const HEADERS_WHITELIST = ["connection", "user-agent", "content-type", "content-length"]

  const getFilteredHeaders = () => {
    return Object.keys(log.request_headers).filter(name => HEADERS_WHITELIST.includes(name) || name.startsWith("x-"))
  }

  return (
    <Card.Container noPadding gutterTop>
      <Card.Header>Headers</Card.Header>
      <KeyValueList.Container ratio="fortySixty">
        {getFilteredHeaders().map(name => (
          <KeyValueList.Row key={name}>
            <KeyValueList.Column>{name}</KeyValueList.Column>
            <KeyValueList.Column>{log.request_headers[name]}</KeyValueList.Column>
          </KeyValueList.Row>
        ))}
      </KeyValueList.Container>
    </Card.Container>
  )
}
