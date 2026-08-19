import React, { useEffect, useState, type FC } from "react"

import { Button } from "@/components/ui/button"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import { getSettings, type Settings as SettingsType } from "@/ui/api/settings"
import { Card, BlockQuote } from "@/ui/components"
import { FilePicker } from "@/ui/components/Form"
import { SectionWrapper } from "@/ui/components/layout"

interface Props {
  token: string
}

export const SettingsGeneral: FC<Props> = ({ token }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [specFile, setSpecFile] = useState<File | null>(null)

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const newVersionAvailable = appVersion && settings?.last_version && settings?.last_version !== appVersion

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

  const importOpenApiHandler = async () => {
    if (!specFile) return

    const formData = new FormData()
    formData.append("file", specFile)

    try {
      const response = await fetch("/backend/settings/openapi", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.error) return failureToast(data.error)

      const skipped = data.skipped?.length ? `, skipped ${data.skipped.length} existing` : ""
      successToast(`Imported ${data.created} endpoints${skipped}`)
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
        <FilePicker accept="text/csv" dataId="settings.restoreFile" onChange={selected => setFile(selected)} />

        <Card.Actions>
          <Button type="button" data-id="settings.restore" disabled={!file} onClick={uploadDumpHandler}>
            Restore
          </Button>
        </Card.Actions>
      </Card.Container>

      <Card.Container gutterTop>
        <Card.Header>Import OpenAPI</Card.Header>
        <BlockQuote>
          Upload an OpenAPI / Swagger specification (YAML or JSON) to generate endpoints and response templates from
          its paths and examples. Path parameters like {"{id}"} become :id. Existing endpoints are skipped.
        </BlockQuote>
        <div className="pt-4">
          <FilePicker accept=".yaml,.yml,.json" dataId="settings.openapiFile" onChange={selected => setSpecFile(selected)} />
        </div>

        <Card.Actions>
          <Button type="button" data-id="settings.openapiImport" disabled={!specFile} onClick={importOpenApiHandler}>
            Import
          </Button>
        </Card.Actions>
      </Card.Container>
    </SectionWrapper>
  )
}
