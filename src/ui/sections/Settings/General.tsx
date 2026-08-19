import React, { useEffect, useState, type FC } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import { getSettings, type Settings as SettingsType } from "@/ui/api/settings"
import { Card, BlockQuote } from "@/ui/components"
import { SectionWrapper } from "@/ui/components/layout"

interface Props {
  token: string
}

export const SettingsGeneral: FC<Props> = ({ token }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const newVersionAvailable = appVersion && settings?.last_version && settings?.last_version !== appVersion

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
        <div className="mb-[14px]">
          <BlockQuote>
            <p>
              <b>New version available</b>
            </p>
            <p>Current version: {appVersion}</p>
            <p>Last version: {settings.last_version}</p>
          </BlockQuote>
        </div>
      )}

      <Card.Container>
        <Card.Header>Backup</Card.Header>
        <BlockQuote>The backup occurs for all data, except for user data and request logs</BlockQuote>

        <Card.Actions>
          <a href={`/backend/settings/dump?token=${token}`} target="_blank" rel="noopener noreferrer">
            <Button type="button" data-id="settings.download">
              Download
            </Button>
          </a>
        </Card.Actions>
      </Card.Container>

      <Card.Container gutterTop>
        <Card.Header>Restore</Card.Header>
        <Input
          type="file"
          className="max-w-sm"
          data-id="settings.restoreFile"
          onChange={onChangeHandler}
          accept="text/csv"
        />

        <Card.Actions>
          <Button type="button" data-id="settings.restore" disabled={!file} onClick={uploadDumpHandler}>
            Restore
          </Button>
        </Card.Actions>
      </Card.Container>
    </SectionWrapper>
  )
}
