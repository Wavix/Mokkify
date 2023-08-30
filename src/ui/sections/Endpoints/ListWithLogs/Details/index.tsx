import { Card, StyledJSON, Skeleton } from "@/ui/components"

import { HeadersDetails } from "./Headers"
import { MainDetails } from "./Main"
import { RelayDetails } from "./Relay"

import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  log: LogAttributes
  isLoading: boolean
}

export const Details: FC<Props> = ({ log, isLoading }) => {
  if (isLoading) return <Skeleton rows={4} />

  return (
    <>
      <MainDetails log={log} />
      <RelayDetails log={log} />

      {log.request_payload && (
        <Card.Container gutterTop>
          <Card.Header>Request body</Card.Header>
          <StyledJSON data={log.request_payload} />
        </Card.Container>
      )}

      {log.response_payload && (
        <Card.Container gutterTop>
          <Card.Header>Response body</Card.Header>
          <StyledJSON data={log.response_payload} />
        </Card.Container>
      )}

      {log.relay_request_body && (
        <Card.Container gutterTop>
          <Card.Header>Relay request body</Card.Header>
          <StyledJSON data={log.relay_request_body} />
        </Card.Container>
      )}

      {log.relay_response_body && (
        <Card.Container gutterTop>
          <Card.Header>Relay response body</Card.Header>
          <StyledJSON data={log.relay_response_body} />
        </Card.Container>
      )}

      <HeadersDetails log={log} />
    </>
  )
}
