import React, { useEffect, useState, type FC } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as apiKeysApi from "@/ui/api/api-keys"
import { Card, ModalWindow, Table } from "@/ui/components"
import { SectionWrapper } from "@/ui/components/layout"

import type { ApiKeyPublicAttributes } from "@/app/services/api-key.service"

interface Props {
  token: string
}

const columns = {
  name: "Name",
  key_id: "Key ID",
  is_active: "Active",
  last_used_at: "Last used",
  actions: ""
}

export const SettingsApiKeys: FC<Props> = ({ token }) => {
  const [keys, setKeys] = useState<Array<ApiKeyPublicAttributes>>([])
  const [name, setName] = useState("")
  const [plaintext, setPlaintext] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<number | null>(null)

  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const fetchKeys = async () => {
    const response = await apiKeysApi.getApiKeysList()
    if (response.error) return failureToast(response.error)
    setKeys(response)
  }

  useEffect(() => {
    if (!token) return
    fetchKeys()
  }, [token])

  const onCreate = async () => {
    if (!name.trim()) return

    const response = await apiKeysApi.createApiKey(name.trim())
    if (response.error) return failureToast(response.error)

    setPlaintext(response.plaintext)
    setName("")
    fetchKeys()
  }

  const onToggle = async (id: number, isActive: boolean) => {
    const response = await apiKeysApi.toggleApiKey(id, isActive)
    if (!response.success) return failureToast("Error updating API key")
    fetchKeys()
  }

  const onRevoke = async () => {
    if (!revokeId) return

    const response = await apiKeysApi.revokeApiKey(revokeId)
    if (!response.success) return failureToast("Error revoking API key")

    successToast("API key revoked")
    fetchKeys()
  }

  const onCopyPlaintext = () => {
    if (!plaintext) return
    navigator.clipboard.writeText(plaintext)
    successToast("API key copied to clipboard")
  }

  return (
    <SectionWrapper title="API Keys" description="Manage credentials for agents and automated tools">
      <Card.Container>
        <Card.Header>Create API key</Card.Header>

        <div className="flex gap-2">
          <Input
            placeholder="Key name"
            data-id="apiKeys.nameInput"
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <Button type="button" data-id="apiKeys.create" disabled={!name.trim()} onClick={onCreate}>
            Create
          </Button>
        </div>
      </Card.Container>

      <Card.Container gutterTop noPadding>
        <Card.Header>Keys</Card.Header>

        <Table.Container columns={columns}>
          {!keys.length && <Table.Cap text="No API keys yet" />}
          {keys.map(key => (
            <Table.Row key={key.id}>
              <Table.Column>{key.name}</Table.Column>
              <Table.Column>{key.key_id}</Table.Column>
              <Table.Column>
                <Switch
                  checked={key.is_active}
                  data-id="apiKeys.toggle"
                  onCheckedChange={checked => onToggle(key.id, checked)}
                />
              </Table.Column>
              <Table.Column>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}</Table.Column>
              <Table.Column>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  data-id="apiKeys.revoke"
                  onClick={() => setRevokeId(key.id)}
                >
                  Revoke
                </Button>
              </Table.Column>
            </Table.Row>
          ))}
        </Table.Container>
      </Card.Container>

      <Dialog open={!!plaintext} onOpenChange={open => !open && setPlaintext(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>Copy this key now — it will not be shown again.</DialogDescription>
          </DialogHeader>

          <Input
            readOnly
            data-id="apiKeys.plaintext"
            value={plaintext || ""}
            onFocus={event => event.target.select()}
          />

          <DialogFooter>
            <Button type="button" data-id="apiKeys.copyPlaintext" onClick={onCopyPlaintext}>
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalWindow
        header="Revoke API key"
        text="This key will stop working immediately. This action cannot be undone."
        isOpen={!!revokeId}
        onClose={() => setRevokeId(null)}
        onConfirmHandler={onRevoke}
      />
    </SectionWrapper>
  )
}
