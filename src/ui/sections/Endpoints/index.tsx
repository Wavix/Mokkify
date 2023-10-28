import Head from "next/head"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as API from "@/ui/api/endpoints"
import { SideMenu, EndpointMenuItem } from "@/ui/components"

import { EndpointsForm } from "./Form"
import { ListWithLogs } from "./ListWithLogs"

import type { EndpointWithResponse } from "@/app/database/interfaces/endpoint.interface"
import type { NextPage } from "next"

const Endpoints: NextPage = () => {
  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [activeEndpoint, setActiveEndpoint] = useState<EndpointWithResponse | null>(null)
  const [endpoints, setEndpoints] = useState<Array<EndpointWithResponse>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const endpointId = Number(router.query.endpointId)

  useEffect(() => {
    const active = endpoints.find(endpoint => endpoint.id === endpointId) || null
    setActiveEndpoint(active)
  }, [endpointId, endpoints.length])

  useEffect(() => {
    getEndpoints()
  }, [])

  const getEndpoints = async (skeleton = true) => {
    if (skeleton) setIsLoading(true)
    const response = await API.getEndpointsList()
    if (response instanceof Error) return failureToast(response.message)
    setEndpoints(response)
    setIsLoading(false)
  }

  const onDeleteEndpoint = async (id: number) => {
    try {
      const response = await API.deleteEndpoint(id)
      if (!response.success) return failureToast("Error deleting endpoint")
      if (activeEndpoint?.id === id) router.push("/endpoints", undefined, { scroll: false, shallow: true })
      getEndpoints(false)
      successToast("Endpoint deleted")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const onFlushLogs = async (id: number) => {
    try {
      const response = await API.flushEndpointLogs(id)
      if (!response.success) return failureToast("Error flushing logs")
      if (activeEndpoint?.id === id) router.push(`/endpoints/${id}`, undefined, { scroll: false, shallow: true })

      successToast("Logs flushed")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const getContent = () => {
    switch (router.pathname) {
      case "/endpoints/create":
        return <EndpointsForm getList={getEndpoints} />
      case "/endpoints/[endpointId]/edit":
        return <EndpointsForm id={endpointId} getList={getEndpoints} />
      default:
        return <ListWithLogs activeEndpoint={activeEndpoint} />
    }
  }

  return (
    <>
      <Head>
        <title>{activeEndpoint ? `Endpoints - ${activeEndpoint.title}` : "Endpoints"}</title>
      </Head>
      <SideMenu.Body
        header="Endpoints"
        onSearch={value => setSearch(value)}
        onNew={() => router.push("/endpoints/create", undefined, { shallow: true })}
      >
        <SideMenu.Nav>
          {isLoading && <SideMenu.Skeleton />}
          {endpoints
            .filter(endpoint => !search.trim() || endpoint.title.toLowerCase().includes(search.trim().toLowerCase()))
            .map(endpoint => (
              <SideMenu.Link
                key={endpoint.id}
                onClick={() => router.push(`/endpoints/${endpoint.id}`, undefined, { scroll: false, shallow: true })}
                isActive={endpointId === endpoint.id}
              >
                <EndpointMenuItem
                  endpoint={endpoint}
                  onEdit={() => router.push(`/endpoints/${endpoint.id}/edit`, undefined, { shallow: true })}
                  onFlushLogs={onFlushLogs}
                  onDelete={onDeleteEndpoint}
                />
              </SideMenu.Link>
            ))}
        </SideMenu.Nav>
      </SideMenu.Body>

      {getContent()}
    </>
  )
}

export default Endpoints
