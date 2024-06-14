import Head from "next/head"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"

import { useFailureToast } from "@/hooks/useFailureToast"
import { useSuccessToast } from "@/hooks/useSuccessToast"
import * as templatesApi from "@/ui/api/templates"
import { Cap, SideMenu } from "@/ui/components"

import { TemplatesForm } from "./Form"
import { TemplateListItem } from "./ListItem"

import type { ResponseTemplateAttributes } from "@/app/database/interfaces/response-template.interface"
import type { NextPage } from "next"

const Templates: NextPage = () => {
  const router = useRouter()
  const failureToast = useFailureToast()
  const successToast = useSuccessToast()

  const [templates, setTemplates] = useState<Array<ResponseTemplateAttributes>>([])
  const [isLoading, setIsLoading] = useState(true)

  const templateId = Number(router.query.templateId)

  useEffect(() => {
    getTemplates()
  }, [])

  const getTemplates = async (skeleton = true) => {
    if (skeleton) setIsLoading(true)
    const response = await templatesApi.getTemplatesList()
    if (response instanceof Error) {
      setIsLoading(false)
      return failureToast("Failed to load template list")
    }

    setTemplates(response)
    setIsLoading(false)
  }

  const onDeleteTemplate = async (id: number) => {
    try {
      const response = await templatesApi.deleteTemplate(id)
      if (!response.success) return failureToast("Error deleting template")
      if (templateId === id) router.push("/templates", undefined, { scroll: false, shallow: true })
      getTemplates(false)
      successToast("Template deleted")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const onDuplicateTemplate = async (id: number) => {
    try {
      const response = await templatesApi.duplicateTemplate(id)
      if (!response.success) return failureToast("Error duplicating template")
      getTemplates(false)
      successToast("Template duplicated")
    } catch (error) {
      failureToast((error as Error).message)
    }
  }

  const getContent = () => {
    switch (router.pathname) {
      case "/templates/create":
        return <TemplatesForm getList={getTemplates} />
      case "/templates/[templateId]/edit":
        return <TemplatesForm id={templateId} getList={getTemplates} />
      default:
        return <Cap title="Response templates" description="Select template to start editing or create a new one" />
    }
  }

  return (
    <>
      <Head>
        <title>Templates</title>
      </Head>
      <SideMenu.Body header="Templates" onNew={() => router.push("/templates/create", undefined, { shallow: true })}>
        {isLoading && <SideMenu.Skeleton />}
        <SideMenu.Nav>
          {templates.map(template => (
            <SideMenu.Link
              key={template.id}
              onClick={() => router.push(`/templates/${template.id}/edit`, undefined, { shallow: true })}
              isActive={templateId === template.id}
            >
              <TemplateListItem template={template} onDelete={onDeleteTemplate} onDuplicate={onDuplicateTemplate} />
            </SideMenu.Link>
          ))}
        </SideMenu.Nav>
      </SideMenu.Body>

      {getContent()}
    </>
  )
}

export default Templates
