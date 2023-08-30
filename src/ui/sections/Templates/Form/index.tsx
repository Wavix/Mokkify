import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { Button, FormControl } from "@chakra-ui/react"

import { parseResponseBody } from "@/app/backend/helpers"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as templatesApi from "@/ui/api/templates"
import { Card, StyledJSON, Skeleton, ResponseConstructor, CategoryBlock } from "@/ui/components"
import { Input } from "@/ui/components/Form"
import { SectionWrapper } from "@/ui/components/layout"

import style from "./style.module.scss"

import type { ResponseTemplateCreationAttributes } from "@/app/database/interfaces/response-template.interface"
import type { FC, FormEvent } from "react"

interface Props {
  id?: number | null
  getList: () => void
}

const defaultState: Partial<ResponseTemplateCreationAttributes> = {
  title: "",
  body: "",
  body_parsed: "",
  code: 200
}

export const TemplatesForm: FC<Props> = ({ id, getList }) => {
  const isEditing = !!id
  const pageTitle = isEditing ? "Edit template" : "Create template"

  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ResponseTemplateCreationAttributes>>(defaultState)
  const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    setFormData(defaultState)

    if ((!formData.id && id) || (formData.id && id && formData.id !== id)) {
      loadTemplate()
    }
  }, [id])

  useEffect(() => {
    parsePreviewPayload()
  }, [formData.body])

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isEditing) return editTemplate()
    createTemplate()
  }

  const createTemplate = async () => {
    const payload = getPayload()

    try {
      const response = await templatesApi.createTemplate(payload)
      if (response.error) return failureToast(response.error)
      successToast("Template successfully created")
      getList()
      router.push(`/templates/${response.id}/edit`, undefined, { shallow: true })
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const editTemplate = async () => {
    const payload = getPayload()

    try {
      const response = await templatesApi.updateTemplate(Number(id), payload)
      if (response.error) return failureToast(response.error)
      successToast("Template successfully updated")
      getList()
    } catch (error) {
      return failureToast((error as Error).message)
    }
  }

  const loadTemplate = async () => {
    try {
      setIsLoading(true)
      const response = await templatesApi.getTemplateById(Number(id))
      if (response.error) return failureToast(response.error)

      setFormData(response)
    } catch (error) {
      return failureToast((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPayload = (): Partial<ResponseTemplateCreationAttributes> => {
    return {
      title: formData.title,
      code: formData.code,
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

                  <FormControl>
                    <Input
                      title="Status code"
                      value={formData.code || 0}
                      onChange={value => setFormData({ ...formData, code: Number(value) })}
                      placeholder="200"
                    />
                  </FormControl>
                </div>
              </CategoryBlock>

              <CategoryBlock title="Response constructor">
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
