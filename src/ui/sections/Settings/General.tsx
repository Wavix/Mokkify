import getConfig from "next/config"
import React, { useEffect, useState, type FC } from "react"

import { Button } from "@chakra-ui/react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import { getSettings, type Settings as SettingsType } from "@/ui/api/settings"
import { Card, BlockQuote } from "@/ui/components"
import { SectionWrapper } from "@/ui/components/layout"

import style from "./style.module.scss"

interface Props {
  token: string
}

export const SettingsGeneral: FC<Props> = ({ token }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { publicRuntimeConfig } = getConfig()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const newVersionAvailable =
    publicRuntimeConfig?.version && settings?.last_version && settings?.last_version !== publicRuntimeConfig?.version

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

  const fetchSettings = async () => {
    try {
      const response = await getSettings()
      setSettings(response)
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SectionWrapper title="Settings" description="General settings">
      {newVersionAvailable && (
        <div className={style.newVersion}>
          <BlockQuote>
            <p>
              <b>New version available</b>
            </p>
            Current version: {publicRuntimeConfig.version}
            <br />
            Last version: {settings.last_version}
          </BlockQuote>
        </div>
      )}

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
  )
}
