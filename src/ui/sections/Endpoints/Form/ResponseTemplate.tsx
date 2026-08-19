import { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import * as endpointsApi from "@/ui/api/endpoints"
import * as templatesApi from "@/ui/api/templates"
import { Select, Switch } from "@/ui/components/Form"

import type { EndpointCreationAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { ResponseTemplateAttributes } from "@/app/database/interfaces/response-template.interface"
import type { FC } from "react"

interface Props {
  isEditing: boolean
  formData: Partial<EndpointCreationAttributes>
  onTemplatesLoad: (templates: Array<ResponseTemplateAttributes>) => void
  onMultipleTemplatesLoad: (templates: Array<number>) => void
  onChange: (data: Partial<EndpointCreationAttributes>) => void
}

export const ResponseTemplate: FC<Props> = ({ formData, isEditing, onChange, onTemplatesLoad, onMultipleTemplatesLoad }) => {
  const failureToast = useFailureToast()
  const [templates, setTemplates] = useState<Array<ResponseTemplateAttributes>>([])

  const templatesOptions = templates.map(template => ({ value: template.id, label: template.title }))

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.getTemplatesList()
      if (response.error) return failureToast(response.error)
      setTemplates(response)
      onTemplatesLoad(response)
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const loadEndpointMultipleTemplates = async () => {
    if (!isEditing || !formData.id) return

    try {
      const response = await endpointsApi.getEndpointMultipleTemplates(Number(formData.id))
      onMultipleTemplatesLoad(response.templates)
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    loadEndpointMultipleTemplates()
  }, [formData.id])

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-5">
      <div>
        <Switch
          title="Random template"
          isChecked={formData.is_multiple_templates}
          onChange={value => onChange({ ...formData, is_multiple_templates: value })}
        />
      </div>

      {formData.is_multiple_templates ? (
        <Select
          title="Random response template"
          hint="Select a set of response templates, one of which will be randomly chosen when replying to a HTTP request."
          value={formData.multiple_responses_templates || []}
          options={templatesOptions}
          onChangeMulti={values => onChange({ ...formData, multiple_responses_templates: values as Array<number> })}
          isMulti
        />
      ) : (
        <Select
          title="Single response template"
          hint="Select a template for responding to the HTTP request."
          value={formData.response_template_id || null}
          options={[{ value: null, label: "No template" }, ...templatesOptions]}
          onChange={value => onChange({ ...formData, response_template_id: Number(value) || null })}
        />
      )}
    </div>
  )
}
