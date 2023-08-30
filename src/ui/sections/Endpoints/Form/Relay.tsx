import { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { getRelaysList } from "@/ui/api/relays"
import { Select, Switch, Input } from "@/ui/components/Form"

import style from "./style.module.scss"

import type { Method, EndpointCreationAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { RelayPayloadTemplateAttributes } from "@/app/database/interfaces/relay-payload-template.interface"
import type { FC } from "react"

interface Props {
  formData: Partial<EndpointCreationAttributes>
  onChange: (data: Partial<EndpointCreationAttributes>) => void
}

export const Relay: FC<Props> = ({ formData, onChange }) => {
  const failureToast = useFailureToast()
  const [relayTemplates, setRelayTemplates] = useState<Array<RelayPayloadTemplateAttributes>>([])

  const relayRemplatesOptions = relayTemplates.map(template => ({ value: template.id, label: template.title }))

  const loadRelayTemplates = async () => {
    try {
      const response = await getRelaysList()
      if (response.error) return failureToast(response.error)
      setRelayTemplates(response)
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  useEffect(() => {
    loadRelayTemplates()
  }, [])

  return (
    <div>
      <Switch
        title="Relay enabled"
        hint="Upon receiving a request, it can be redirected to another URL using the chosen method and template for the payload."
        isChecked={formData.relay_enabled}
        onChange={checked => onChange({ ...formData, relay_enabled: checked })}
      />

      <div className={style.relayContainer}>
        <Select
          title="Request template"
          hint="Choose a template with the request body that will be sent to the relay target"
          disabled={!formData.relay_enabled}
          value={formData.relay_payload_template_id || null}
          options={[{ value: null, label: "No template" }, ...relayRemplatesOptions]}
          onChange={value => onChange({ ...formData, relay_payload_template_id: Number(value) || null })}
        />

        <Select
          title="Method"
          value={formData.relay_method}
          disabled={!formData.relay_enabled}
          options={[
            { value: "PUT", label: "PUT" },
            { value: "PATCH", label: "PATCH" },
            { value: "GET", label: "GET" },
            { value: "POST", label: "POST" },
            { value: "DELETE", label: "DELETE" }
          ]}
          onChange={value => {
            onChange({ ...formData, relay_method: value as Method })
          }}
        />
      </div>

      <div className={style.relayTargetContainer}>
        <Input
          title="Target"
          hint="URL or path to the key from which the URL will be taken as the target. To extract the URL from the request body, use nested notation separated by a dot. For example (dlr.callback_url)."
          placeholder="https://example.com/api/relay"
          value={formData.relay_target || ""}
          disabled={!formData.relay_enabled}
          onChange={value => onChange({ ...formData, relay_target: value })}
        />
      </div>
    </div>
  )
}
