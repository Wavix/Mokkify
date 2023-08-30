import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as relaysApi from "@/ui/api/relays"
import { SideMenu } from "@/ui/components/layout"

import { RelayTemplatesForm } from "./Form"
import { RelaysTempolateListItem } from "./ListItem"

import type { RelayPayloadTemplateAttributes } from "@/app/database/interfaces/relay-payload-template.interface"
import type { NextPage } from "next"

const Relays: NextPage = () => {
  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [relays, setRelays] = useState<Array<RelayPayloadTemplateAttributes>>([])
  const [isLoading, setIsLoading] = useState(true)

  const relayId = Number(router.query.relayId)

  useEffect(() => {
    getRelays()
  }, [])

  const getRelays = async (skeleton = true) => {
    if (skeleton) setIsLoading(true)
    const response = await relaysApi.getRelaysList()
    if (response instanceof Error) {
      setIsLoading(false)
      return failureToast("Failed to load relays list")
    }

    setRelays(response)
    setIsLoading(false)
  }

  const onDeleteRelayTemplate = async (id: number) => {
    try {
      const response = await relaysApi.deleteRelayTemplate(id)
      if (!response.success) return failureToast("Error deleting relay template")
      if (relayId === id) router.push("/relays", undefined, { scroll: false, shallow: true })
      getRelays(false)
      successToast("Relay template deleted")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const onDuplicateRelayTemplate = async (id: number) => {
    try {
      const response = await relaysApi.duplicateRelayTemplate(id)
      if (!response.success) return failureToast("Error duplicating relay template")
      getRelays(false)
      successToast("Relay template duplicated")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const getContent = () => {
    switch (router.pathname) {
      case "/relays/create":
        return <RelayTemplatesForm getList={getRelays} />
      case "/relays/[relayId]/edit":
        return <RelayTemplatesForm id={relayId} getList={getRelays} />
      default:
        return null
    }
  }

  return (
    <>
      <SideMenu.Body header="Relays" onNew={() => router.push("/relays/create", undefined, { shallow: true })}>
        {isLoading && <SideMenu.Skeleton />}
        <SideMenu.Nav>
          {relays.map(relay => (
            <SideMenu.Link
              key={relay.id}
              onClick={() => router.push(`/relays/${relay.id}/edit`, undefined, { shallow: true })}
              isActive={relayId === relay.id}
            >
              <RelaysTempolateListItem
                relay={relay}
                onDelete={onDeleteRelayTemplate}
                onDuplicate={onDuplicateRelayTemplate}
              />
            </SideMenu.Link>
          ))}
        </SideMenu.Nav>
      </SideMenu.Body>

      {getContent()}
    </>
  )
}

export default Relays
