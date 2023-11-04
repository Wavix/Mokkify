import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement
} from "chart.js"
import Head from "next/head"
import React from "react"

import { SectionWrapper } from "@/ui/components/layout"

import { RPSGraphic } from "./RPSGraphic"

import type { EndpointAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { FC } from "react"

interface Props {
  endpoint: EndpointAttributes
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement)

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
