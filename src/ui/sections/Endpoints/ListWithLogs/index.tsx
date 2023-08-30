import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"

import { config } from "@/config"
import * as API from "@/ui/api/endpoints"
import { listInitial } from "@/ui/api/helpers"
import { EndpointHref, Card, Table, Skeleton, Pagination, usePagination } from "@/ui/components"
import { SectionWrapper } from "@/ui/components/layout"

import { Cap } from "./Cap"
import { Details } from "./Details"
import style from "./style.module.scss"

import type { EndpointWithResponse } from "@/app/database/interfaces/endpoint.interface"
import type { LogAttributes } from "@/app/database/interfaces/log.interface"
import type { FC } from "react"

interface Props {
  activeEndpoint: EndpointWithResponse | null
}

const columns = {
  created_at: "Date",
  response_template: "Response template",
  request_ip: "Host",
  response_code: "Status"
}

const REFRESH_LOGS_INTERVAL = 5_000

export const ListWithLogs: FC<Props> = ({ activeEndpoint }) => {
  const router = useRouter()

  const { page, limit } = usePagination()
  const [logs, setLogs] = useState<ListResponse<LogAttributes>>(listInitial)

  const [activeLog, setActiveLog] = useState<LogAttributes | null>(null)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [isLogLoading, setIsLogLoading] = useState(false)
  const updateInterval = useRef<NodeJS.Timeout | null>(null)

  const endpointId = Number(router.query.endpointId)
  const logId = Number(router.query.logId)

  useEffect(() => {
    if (!endpointId) return
    window.scrollTo(0, 0)
    setActiveLog(null)
    setLogs(listInitial)
    getLogs()
    startUpdateInterval()
  }, [endpointId, page, limit])

  useEffect(() => {
    if (!logId) return
    window.scrollTo(0, 0)
    getLog()
  }, [logId])

  useEffect(() => {
    return () => {
      if (updateInterval.current) clearInterval(updateInterval.current)
    }
  }, [])

  const getLogs = async (skeleton = true) => {
    if (skeleton) setIsLogsLoading(true)
    const response = await API.getEndpointLogs(endpointId, { page, limit })
    if (response instanceof Error) return setIsLogsLoading(false)
    setLogs(response)
    setIsLogsLoading(false)
  }

  const getLog = async () => {
    setIsLogLoading(true)
    const response = await API.getLogById(logId)
    setActiveLog(response)
    setIsLogLoading(false)
  }

  const startUpdateInterval = () => {
    if (updateInterval.current) clearInterval(updateInterval.current)
    if (page === 1) updateInterval.current = setInterval(() => getLogs(false), REFRESH_LOGS_INTERVAL)
  }

  if (!activeEndpoint) return <Cap />

  return (
    <>
      <title>Endpoints</title>
      <SectionWrapper
        title={activeEndpoint?.title || "Endpoint Requests"}
        description={<EndpointHref method={activeEndpoint?.method || "GET"} href={activeEndpoint?.path || ""} />}
      >
        <div className={style.endpointsContentLayout}>
          <div>
            {isLogsLoading && <Skeleton rows={10} />}
            {!isLogsLoading && (
              <Card.Container noPadding>
                <Table.Container columns={columns}>
                  {logs?.items?.map(log => (
                    <Table.Row
                      key={log.id}
                      onClick={() =>
                        router.push(`/endpoints/${endpointId}/logs/${log.id}`, undefined, {
                          scroll: false,
                          shallow: true
                        })
                      }
                      isActive={logId === log.id}
                    >
                      <Table.Column>{dayjs(log.created_at).format(config.dateFormat)}</Table.Column>
                      <Table.Column>{log.template_name || "-"}</Table.Column>
                      <Table.Column>{log.request_ip}</Table.Column>
                      <Table.Column>{log.response_code}</Table.Column>
                    </Table.Row>
                  ))}
                </Table.Container>
              </Card.Container>
            )}

            <div>
              <Pagination pagination={logs.pagination} />
            </div>
          </div>
          <div>{activeLog && <Details log={activeLog} isLoading={isLogLoading} />}</div>
        </div>
      </SectionWrapper>
    </>
  )
}
