import React from "react"

import { Badge } from "@chakra-ui/react"

import type { Method } from "@/app/database/interfaces/endpoint.interface"
import type { FC } from "react"

interface Props {
  method: Method
}

export const MethodBadge: FC<Props> = ({ method }) => {
  const getMethodColor = (): string => {
    switch (method) {
      case "GET":
        return "cyan"

      case "DELETE":
        return "red"

      case "POST":
        return "green"

      case "PATCH":
        return "teal"

      case "PUT":
        return "orange"

      case "HEAD":
        return "purple"

      case "OPTIONS":
        return "blue"

      default:
        return ""
    }
  }

  return (
    <Badge
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight={600}
      borderRadius="4px"
      userSelect="none"
      width="56px"
      height="24px"
      variant="solid"
      colorScheme={getMethodColor()}
    >
      {method.toUpperCase()}
    </Badge>
  )
}
