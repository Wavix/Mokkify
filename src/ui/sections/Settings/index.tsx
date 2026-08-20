import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { SideMenu } from "@/ui/components"

import { SettingsApiKeys } from "./ApiKeys"
import { SettingsGeneral } from "./General"

import type { NextPage } from "next"

const Settings: NextPage = () => {
  const router = useRouter()

  const [token, setToken] = useState("")

  const getContent = () => {
    switch (router.query.slug) {
      case "general":
        return <SettingsGeneral token={token} />
      case "api-keys":
        return <SettingsApiKeys token={token} />
      default:
        return null
    }
  }

  useEffect(() => {
    const jwt = localStorage.getItem("auth_jwt")
    if (!jwt) return
    setToken(jwt)
  }, [])

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <SideMenu.Body header="Settings">
        <SideMenu.Nav>
          <SideMenu.Link
            onClick={() => router.push("/settings/general", undefined, { shallow: true })}
            isActive={router.query.slug === "general"}
          >
            <SideMenu.LinkText content="General" />
          </SideMenu.Link>
          <SideMenu.Link
            onClick={() => router.push("/settings/api-keys", undefined, { shallow: true })}
            isActive={router.query.slug === "api-keys"}
          >
            <SideMenu.LinkText content="API Keys" />
          </SideMenu.Link>
        </SideMenu.Nav>
      </SideMenu.Body>

      {getContent()}
    </>
  )
}

export default Settings
