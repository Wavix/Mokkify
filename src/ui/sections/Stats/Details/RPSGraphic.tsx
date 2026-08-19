import React, { useEffect, useRef } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getEndpointRps } from "@/ui/api/stats"
import { Card } from "@/ui/components"

import type { ChartConfig } from "@/components/ui/chart"
import type { RPSItem } from "@/ui/api/stats"
import type { FC } from "react"

interface Props {
  endpointId: number
}

const REFRESH_LOGS_INTERVAL = 20_000

const chartConfig = {
  rps: {
    label: "RPS",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig

export const RPSGraphic: FC<Props> = ({ endpointId }) => {
  const [stats, setStats] = React.useState<Array<RPSItem>>([])
  const updateInterval = useRef<NodeJS.Timeout | null>(null)

  const getStats = async () => {
    const data = await getEndpointRps(endpointId)

    const rpsLimited = data.rps?.reverse().slice(0, 300).reverse()
    if (data.rps) setStats(rpsLimited)
  }

  const startUpdateInterval = () => {
    if (updateInterval.current) clearInterval(updateInterval.current)
    updateInterval.current = setInterval(() => getStats(), REFRESH_LOGS_INTERVAL)
  }

  useEffect(() => {
    getStats()
    startUpdateInterval()

    return () => {
      if (updateInterval.current) clearInterval(updateInterval.current)
    }
  }, [endpointId])

  const chartData = stats.map(item => {
    const [, time] = item.date.split(" ")
    return { time, rps: item.rps }
  })

  return (
    <Card.Container>
      <Card.Header>Requests per second</Card.Header>
      <ChartContainer config={chartConfig} className="h-[340px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="rps" fill="var(--color-rps)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card.Container>
  )
}
