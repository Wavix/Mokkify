import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { Button, FormControl } from "@chakra-ui/react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as endpointsApi from "@/ui/api/endpoints"
import { StyledJSON, Card, Skeleton, CategoryBlock } from "@/ui/components"
import { Input, Select } from "@/ui/components/Form"
import { SectionWrapper } from "@/ui/components/layout"

import { Relay } from "./Relay"
import { ResponseTemplate } from "./ResponseTemplate"
import style from "./style.module.scss"

import type { Method, EndpointCreationAttributes } from "@/app/database/interfaces/endpoint.interface"
import type { ResponseTemplateAttributes } from "@/app/database/interfaces/response-template.interface"
import type { FC, FormEvent } from "react"

interface Props {
  id?: number | null
  getList: (skeleton: boolean) => void
}

const defaultState: Partial<EndpointCreationAttributes> = {
  title: "",
  method: "GET",
  path: "",
  uuid: "",
  max_pending_time: null,
  response_template_id: null,
  is_multiple_templates: false,
  relay_payload_template_id: null,
  multiple_responses_templates: [],
  relay_enabled: false,
  relay_target: null,
  relay_method: "POST"
}

export const EndpointsForm: FC<Props> = ({ id, getList }) => {
  const isEditing = !!id
  const pageTitle = isEditing ? "Edit endpoint" : "Create endpoint"

  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<EndpointCreationAttributes>>(defaultState)

  const [templates, setTemplates] = useState<Array<ResponseTemplateAttributes>>([])
  const multipleResponseTemplates = formData.multiple_responses_templates || []

  useEffect(() => {
    if (id) loadEndpoint()
  }, [id])

  useEffect(() => {
    setFormData(defaultState)
  }, [router.pathname])

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isEditing) return editEndpoint()
    createEndpoint()
  }

  const updateEndpointMultipleTemplates = async (endpointId: number) => {
    try {
      await endpointsApi.updateEndpointMultipleTemplates(endpointId, multipleResponseTemplates)
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const createEndpoint = async () => {
    const payload = getPayload()
    try {
      const response = await endpointsApi.createEndpoint(payload)
      if (response.error) return failureToast(response.error)
      await updateEndpointMultipleTemplates(response.id)
      successToast("Endpoint successfully created")
      getList(false)
      router.push(`/endpoints/${response.id}`, undefined, { shallow: true })
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const editEndpoint = async () => {
    const payload = getPayload()
    try {
      const response = await endpointsApi.updateEndpoint(Number(id), payload)
      if (response.error) return failureToast(response.error)
      await updateEndpointMultipleTemplates(Number(id))
      successToast("Endpoint successfully updated")
      getList(false)
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const loadEndpoint = async () => {
    try {
      setIsLoading(true)
      const response = await endpointsApi.getEndpointById(Number(id))
      if (response.error) return failureToast(response.error)
      setFormData(response)
    } catch (error) {
      return failureToast((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getTemplateById = (templateId: number): ResponseTemplateAttributes | null => {
    return templates.find(template => template.id === templateId) || null
  }

  const getPayload = (): Partial<EndpointCreationAttributes> => {
    return {
      title: formData.title,
      method: formData.method,
      max_pending_time: formData.max_pending_time || null,
      path: formData.path,
      response_template_id: formData.response_template_id || null,
      is_multiple_templates: formData.is_multiple_templates,
      relay_payload_template_id: formData.relay_payload_template_id || null,
      relay_enabled: formData.relay_enabled || false,
      relay_target: formData.relay_target || null,
      relay_method: formData.relay_method || "POST"
    }
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <SectionWrapper title={pageTitle}>
        <Card.Container>
          {isLoading && <Skeleton />}
          {!isLoading && (
            <form onSubmit={onSubmitHandler}>
              <CategoryBlock title="General">
                <div className={style.formContentLayout}>
                  <FormControl isRequired>
                    <Input
                      onChange={value => setFormData({ ...formData, title: value })}
                      value={formData.title}
                      title="Title"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <Input
                      title="Path"
                      onChange={value => setFormData({ ...formData, path: value })}
                      value={formData.path}
                      placeholder="/my/end/point"
                      readOnly={isEditing}
                      disabled={isEditing}
                      isRequired
                    />
                  </FormControl>

                  <FormControl>
                    <Input
                      title="Max pending time"
                      hint="Artificial response delay time (in seconds). Specify the maximum value here, which will be randomly selected from zero to the indicated value."
                      value={formData.max_pending_time || ""}
                      onChange={value => setFormData({ ...formData, max_pending_time: Number(value) })}
                      placeholder="0"
                    />
                  </FormControl>

                  <Select
                    title="Method"
                    value={formData.method}
                    options={[
                      { value: "PUT", label: "PUT" },
                      { value: "PATCH", label: "PATCH" },
                      { value: "GET", label: "GET" },
                      { value: "POST", label: "POST" },
                      { value: "DELETE", label: "DELETE" }
                    ]}
                    onChange={value => {
                      setFormData({ ...formData, method: value as Method })
                    }}
                  />
                </div>
              </CategoryBlock>

              <CategoryBlock title="Response template">
                <div className={style.formContentLayout}>
                  <ResponseTemplate
                    isEditing={isEditing}
                    formData={formData}
                    onChange={data => setFormData(data)}
                    onTemplatesLoad={data => setTemplates(data)}
                  />
                </div>
              </CategoryBlock>

              <CategoryBlock title="Relay webhook">
                <Relay formData={formData} onChange={data => setFormData(data)} />
              </CategoryBlock>

              <Card.Actions>
                <Button type="submit" color="white" colorScheme="purple">
                  {isEditing ? "Save" : "Create"}
                </Button>
              </Card.Actions>
            </form>
          )}
        </Card.Container>

        {!isLoading && (
          <>
            {formData.is_multiple_templates ? (
              <>
                {multipleResponseTemplates.map(templateId => (
                  <Card.Container key={templateId} gutterTop>
                    <Card.Header>Response template ({getTemplateById(templateId)?.title})</Card.Header>
                    <StyledJSON data={getTemplateById(templateId)?.body_parsed} />
                  </Card.Container>
                ))}
              </>
            ) : (
              <Card.Container gutterTop>
                <Card.Header>Response template</Card.Header>
                <StyledJSON data={getTemplateById(Number(formData.response_template_id))?.body_parsed} />
              </Card.Container>
            )}
          </>
        )}
      </SectionWrapper>
    </>
  )
}
