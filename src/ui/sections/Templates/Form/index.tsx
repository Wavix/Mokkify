import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { parseResponseBody } from "@/app/backend/helpers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as templatesApi from "@/ui/api/templates"
import { Card, StyledJSON, Skeleton, ResponseConstructor, CategoryBlock } from "@/ui/components"
import { Input, Select, HeadersEditor, type HeaderRow } from "@/ui/components/Form"
import { SectionWrapper } from "@/ui/components/layout"

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
  code: 200,
  content_type: "application/json"
}

const CONTENT_TYPE_OPTIONS = [
  { value: "application/json", label: "application/json" },
  { value: "text/plain", label: "text/plain" },
  { value: "text/html", label: "text/html" },
  { value: "application/xml", label: "application/xml" },
  { value: "text/csv", label: "text/csv" }
]

export const TemplatesForm: FC<Props> = ({ id, getList }) => {
  const isEditing = !!id
  const pageTitle = isEditing ? "Edit template" : "Create template"

  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ResponseTemplateCreationAttributes>>(defaultState)
  const [headerRows, setHeaderRows] = useState<Array<HeaderRow>>([])
  const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(null)

  const isJson = (formData.content_type || "application/json").includes("json")

  useEffect(() => {
    setFormData(defaultState)
    setHeaderRows([])
    if (id) loadTemplate()
  }, [id])

  useEffect(() => {
    parsePreviewPayload()
  }, [formData.body])

  useEffect(() => {
    setFormData(defaultState)
    setHeaderRows([])
    setPreviewPayload(null)
  }, [router.pathname])

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
      setHeaderRows(Object.entries(response.headers || {}).map(([key, value]) => ({ key, value: String(value) })))
    } catch (error) {
      return failureToast((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPayload = (): Partial<ResponseTemplateCreationAttributes> => {
    const headers: Record<string, string> = {}
    headerRows.filter(row => row.key.trim()).forEach(row => (headers[row.key.trim()] = row.value))

    return {
      title: formData.title,
      code: formData.code,
      body: formData.body,
      content_type: formData.content_type || "application/json",
      headers: Object.keys(headers).length ? headers : null
    }
  }

  const onConstructorChange = (body: string) => {
    setFormData({ ...formData, body })
  }

  const parsePreviewPayload = () => {
    if (!formData.body || !isJson) return setPreviewPayload(null)
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
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <SectionWrapper title={pageTitle}>
        <Card.Container>
          {isLoading && <Skeleton rows={3} />}
          {!isLoading && (
            <form onSubmit={onSubmitHandler}>
              <CategoryBlock title="General">
                <div className="grid grid-cols-2 gap-[14px]">
                  <div>
                    <Input
                      title="Title"
                      onChange={value => setFormData({ ...formData, title: value })}
                      value={formData.title}
                    />
                  </div>

                  <div>
                    <Input
                      title="Status code"
                      value={formData.code || 0}
                      onChange={value => setFormData({ ...formData, code: Number(value) })}
                      placeholder="200"
                    />
                  </div>

                  <Select
                    title="Content type"
                    value={formData.content_type || "application/json"}
                    options={CONTENT_TYPE_OPTIONS}
                    onChange={value => setFormData({ ...formData, content_type: String(value) })}
                  />
                </div>
              </CategoryBlock>

              <CategoryBlock title="Response headers">
                <HeadersEditor rows={headerRows} onChange={setHeaderRows} />
              </CategoryBlock>

              {isJson ? (
                <CategoryBlock title="Response constructor">
                  <ResponseConstructor bodyRaw={formData.body || ""} onChange={onConstructorChange} />
                </CategoryBlock>
              ) : (
                <CategoryBlock title="Response body">
                  <Textarea
                    value={formData.body || ""}
                    data-id="templateForm.rawBody"
                    placeholder="Raw response body. Variables like @uuid, @date, @request.field and @path.param are supported."
                    className="bg-background h-[300px] font-mono text-sm"
                    onChange={event => setFormData({ ...formData, body: event.target.value })}
                  />
                </CategoryBlock>
              )}

              <Card.Actions>
                <Button type="submit" data-id="templateForm.submit">
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
