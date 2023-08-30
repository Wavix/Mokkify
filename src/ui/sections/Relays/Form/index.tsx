import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { Button, FormControl } from "@chakra-ui/react"

import { parseResponseBody } from "@/app/backend/helpers"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as relaysApi from "@/ui/api/relays"
import { Card, StyledJSON, Skeleton, ResponseConstructor, CategoryBlock } from "@/ui/components"
import { Input } from "@/ui/components/Form"
import { SectionWrapper } from "@/ui/components/layout"

import style from "./style.module.scss"

import type { RelayPayloadTemplateAttributes } from "@/app/database/interfaces/relay-payload-template.interface"
import type { FC, FormEvent } from "react"

interface Props {
  id?: number | null
  getList: () => void
}

const defaultState: Partial<RelayPayloadTemplateAttributes> = {
  title: "",
  body: ""
}

export const RelayTemplatesForm: FC<Props> = ({ id, getList }) => {
  const isEditing = !!id
  const pageTitle = isEditing ? "Edit relay template" : "Create relay template"

  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<RelayPayloadTemplateAttributes>>(defaultState)
  const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (id) loadRelayTemplate()
  }, [id])

  useEffect(() => {
    setFormData(defaultState)
    setPreviewPayload(null)
  }, [router.pathname])

  useEffect(() => {
    parsePreviewPayload()
  }, [formData.body])

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isEditing) return editTemplate()
    createRelayTemplate()
  }

  const createRelayTemplate = async () => {
    const payload = getPayload()

    try {
      const response = await relaysApi.createRelayTemplate(payload)
      if (response.error) return failureToast(response.error)
      successToast("Relay template successfully created")
      getList()
      router.push(`/relays/${response.id}/edit`, undefined, { shallow: true })
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const editTemplate = async () => {
    const payload = getPayload()

    try {
      const response = await relaysApi.updateRelayTemplate(Number(id), payload)
      if (response.error) return failureToast(response.error)
      successToast("Relay template successfully updated")
      getList()
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const loadRelayTemplate = async () => {
    try {
      setIsLoading(true)
      const response = await relaysApi.getRelayTemplateById(Number(id))
      if (response.error) return failureToast(response.error)

      setFormData(response)
    } catch (error) {
      return failureToast((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPayload = (): Partial<RelayPayloadTemplateAttributes> => {
    return {
      title: formData.title,
      body: formData.body
    }
  }

  const onConstructorChange = (body: string) => {
    setFormData({ ...formData, body })
  }

  const parsePreviewPayload = () => {
    if (!formData.body) return setPreviewPayload(null)
    try {
      const parsedString = parseResponseBody(formData.body || "")
      const json = JSON.parse(parsedString || "")
      setPreviewPayload(json)
    } catch {
      setPreviewPayload(null)
    }
  }

  return (
    <>
      <title>{pageTitle}</title>
      <SectionWrapper title={pageTitle}>
        <Card.Container>
          {isLoading && <Skeleton rows={3} />}
          {!isLoading && (
            <form onSubmit={onSubmitHandler}>
              <CategoryBlock title="General">
                <div className={style.templateGeneral}>
                  <FormControl isRequired>
                    <Input
                      title="Title"
                      onChange={value => setFormData({ ...formData, title: value })}
                      value={formData.title}
                    />
                  </FormControl>
                </div>
              </CategoryBlock>

              <CategoryBlock title="Request payload constructor">
                <ResponseConstructor bodyRaw={formData.body || ""} onChange={onConstructorChange} />
              </CategoryBlock>

              <Card.Actions>
                <Button type="submit" display="block" color="white" colorScheme="purple">
                  {isEditing ? "Save" : "Create"}
                </Button>
              </Card.Actions>
            </form>
          )}
        </Card.Container>

        {previewPayload && (
          <Card.Container gutterTop>
            <Card.Header>Response preview</Card.Header>
            <StyledJSON data={previewPayload} />
          </Card.Container>
        )}
      </SectionWrapper>
    </>
  )
}
