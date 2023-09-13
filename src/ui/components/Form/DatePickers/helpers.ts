import dayjs from "dayjs"

import type { Dates } from "./types"

export const getToday = () => dayjs().format("MM/DD/YYYY")

export const getYesterday = (): Dates => ({
  from: new Date(dayjs().subtract(1, "day").format("MM/DD/YYYY")),
  to: new Date(dayjs().subtract(1, "day").format("MM/DD/YYYY"))
})

export const getTwoDaysAgo = (): Dates => ({
  from: new Date(dayjs().subtract(2, "day").format("MM/DD/YYYY")),
  to: new Date(dayjs().subtract(2, "day").format("MM/DD/YYYY"))
})

export const getThisWeek = (): Dates => ({
  from: new Date(dayjs().startOf("week").format("MM/DD/YYYY")),
  to: new Date(dayjs().format("MM/DD/YYYY"))
})

export const getThisMonth = (): Dates => ({
  from: new Date(dayjs().startOf("month").format("MM/DD/YYYY")),
  to: new Date(dayjs().format("MM/DD/YYYY"))
})
