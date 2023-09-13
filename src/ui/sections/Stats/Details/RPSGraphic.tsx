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
import React, { useEffect, useRef } from "react"
import { Bar } from "react-chartjs-2"

import { getEndpointRps } from "@/ui/api/stats"
import { Card } from "@/ui/components"

// import style from "./style.module.scss"
import type { RPSItem } from "@/ui/api/stats"
import type { FC } from "react"

interface Props {
  endpointId: number
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement)

const REFRESH_LOGS_INTERVAL = 20_000

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

  const data = {
    labels: stats?.map(item => {
      const [, time] = item.date.split(" ")
      return time
    }),
    datasets: [
      {
        label: "RPS",
        data: stats.map(stat => stat.rps),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "#553c9a"
      }
    ]
  }

  return (
    <Card.Container>
      <Bar height={100} options={{ responsive: true, maintainAspectRatio: true }} data={data} />
    </Card.Container>
  )
}
