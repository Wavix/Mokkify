import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

import { Card } from "@/ui/components"
import { FilterInput, RangeDatePicker } from "@/ui/components/Form"

import style from "./style.module.scss"

import type { NextPage } from "next"

type SelectedDate = Date | null

export const Filters: NextPage = () => {
  const router = useRouter()

  const initialFrom = router.query.from ? dayjs(String(router.query.from)).toDate() : null
  const initialTo = router.query.to ? dayjs(String(router.query.to)).toDate() : null
  const [range, setRange] = useState<[SelectedDate, SelectedDate]>([initialFrom, initialTo])

  const onChangeTemplate = (value: string | number | null) => {
    if (!value || !String(value).trim()) {
      delete router.query.template
      router.query.page = String(1)
      router.push(router)
      return
    }

    router.query.template = String(value)
    router.query.page = String(1)
    router.push(router)
  }

  const onChangeStatusCode = (code: string | number | null) => {
    if (!code) {
      delete router.query.code
      router.push(router)
      return
    }

    router.query.code = String(code)
    router.query.page = String(1)
    router.push(router)
  }

  const onChangeHost = (host: string | number | null) => {
    if (!host) {
      delete router.query.host
      router.push(router)
      return
    }

    router.query.host = String(host)
    router.query.page = String(1)
    router.push(router)
  }

  const onDateChange = () => {
    const [from, to] = range

    if (!from) {
      delete router.query.from
    } else {
      router.query.from = dayjs(from).format()
    }

    if (!to) {
      delete router.query.to
    } else {
      router.query.to = dayjs(to).format()
    }

    router.query.page = String(1)
    router.push(router)
  }

  useEffect(() => {
    onDateChange()
  }, [range])

  return (
    <div className={style.filters}>
      <Card.Container>
        <div className={style.container}>
          <RangeDatePicker
            startDate={range[0] || undefined}
            endDate={range[1] || undefined}
            onChange={selectedRange => setRange([selectedRange.from, selectedRange.to])}
          />

          <FilterInput placeholder="Host" defaultValue={String(router.query.host || "")} onChange={onChangeHost} />

          <FilterInput
            placeholder="Template name"
            defaultValue={String(router.query.template || "")}
            onChange={onChangeTemplate}
          />

          <FilterInput
            defaultValue={Number(router.query.code) || null}
            placeholder="Status code"
            type="number"
            onChange={onChangeStatusCode}
          />
        </div>
      </Card.Container>
    </div>
  )
}
