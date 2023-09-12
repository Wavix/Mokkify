import { useState } from "react"
import { useRouter } from "next/router"

import style from "./style.module.scss"

import { Card, RangeDatePicker } from "@/ui/components"
import { FilterInput } from "@/ui/components/Form"

import type { NextPage } from "next"

interface Props {}

type SelectedDate = Date | null

export const Filters: NextPage<Props> = () => {
  const router = useRouter()

  const [range, setRange] = useState<[SelectedDate, SelectedDate]>([null, null])

  const onChangeTemplate = (value: string | number | null) => {
    if (!value || !String(value).trim()) {
      delete router.query.template
      router.push(router)
      return
    }

    router.query.template = String(value)
    router.push(router)
  }

  const onChangeStatusCode = (code: string | number | null) => {
    if (!code) {
      delete router.query.code
      router.push(router)
      return
    }

    router.query.code = String(code)
    router.push(router)
  }

  const onChangeHost = (host: string | number | null) => {
    if (!host) {
      delete router.query.host
      router.push(router)
      return
    }

    router.query.host = String(host)
    router.push(router)
  }

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
