import Head from "next/head"
import React from "react"

import { SectionWrapper } from "@/ui/components/layout"

import { RPSGraphic } from "./RPSGraphic"

import type { EndpointAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { FC } from "react"

interface Props {
  endpoint: EndpointAttributes
}

export const StatsDetails: FC<Props> = ({ endpoint }) => {
  return (
    <>
      <Head>
        <title>{endpoint.title}</title>
      </Head>
      <SectionWrapper title={endpoint.title} description="Endpoint metrics">
        <RPSGraphic endpointId={endpoint.id} />
      </SectionWrapper>
    </>
  )
}
