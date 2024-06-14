import Head from "next/head"
import React, { useEffect, useState } from "react"

import { Button } from "@chakra-ui/react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import { SideMenu, Card, BlockQuote } from "@/ui/components"
import { SectionWrapper } from "@/ui/components/layout"

import type { NextPage } from "next"

const Settings: NextPage = () => {
  const [token, setToken] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return
    setFile(event.target.files[0])
  }

  const uploadDumpHandler = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      await fetch("/backend/settings/dump", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      successToast("Backup uploaded")
    } catch (error) {
      failureToast((error as Error).message)
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
        <SideMenu.Nav> </SideMenu.Nav>
      </SideMenu.Body>

      <SectionWrapper title="Settings">
        <Card.Container>
          <Card.Header>Backup</Card.Header>
          <BlockQuote>The backup occurs for all data, except for user data and request logs</BlockQuote>

          <Card.Actions>
            <a href={`/backend/settings/dump?token=${token}`} target="_blank" rel="noopener noreferrer">
              <Button type="submit" color="white" colorScheme="purple">
                Download
              </Button>
            </a>
          </Card.Actions>
        </Card.Container>

        <Card.Container gutterTop>
          <Card.Header>Restore</Card.Header>
          <input type="file" onChange={onChangeHandler} accept="text/csv" />

          <Card.Actions>
            <Button type="submit" color="white" colorScheme="purple" isDisabled={!file} onClick={uploadDumpHandler}>
              Restore
            </Button>
          </Card.Actions>
        </Card.Container>
      </SectionWrapper>
    </>
  )
}

export default Settings
