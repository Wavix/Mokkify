import Head from "next/head"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import * as API from "@/ui/api/endpoints"
import { SideMenu, EndpointMenuItem, Cap } from "@/ui/components"

import { StatsDetails } from "./Details"

import type { EndpointAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { NextPage } from "next"

const Stats: NextPage = () => {
  const router = useRouter()
  const failureToast = useFailureToast()

  const [activeEndpoint, setActiveEndpoint] = useState<EndpointAttributes | null>(null)
  const [endpoints, setEndpoints] = useState<Array<EndpointAttributes>>([])
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

  return (
    <>
      <Head>
        <title>{activeEndpoint ? `Stats - ${activeEndpoint.title}` : "Stats"}</title>
      </Head>
      <SideMenu.Body header="Stats" onSearch={value => setSearch(value)}>
        <SideMenu.Nav>
          {isLoading && <SideMenu.Skeleton />}
          {endpoints
            .filter(endpoint => !search.trim() || endpoint.title.toLowerCase().includes(search.trim().toLowerCase()))
            .map(endpoint => (
              <SideMenu.Link
                key={endpoint.id}
                onClick={() => router.push(`/stats/${endpoint.id}`, undefined, { scroll: false, shallow: true })}
                isActive={endpointId === endpoint.id}
              >
                <EndpointMenuItem endpoint={endpoint} />
              </SideMenu.Link>
            ))}
        </SideMenu.Nav>
      </SideMenu.Body>

      {activeEndpoint ? (
        <StatsDetails endpoint={activeEndpoint} />
      ) : (
        <Cap title="Stats" description="Endpoint metrics" />
      )}
    </>
  )
}

export default Stats
