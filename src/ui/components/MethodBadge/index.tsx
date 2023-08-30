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
      case "PUT":
        return "teal"

      default:
        return ""
    }
  }

  return (
    <Badge
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="3px"
      width="56px"
      height="24px"
      variant="solid"
      colorScheme={getMethodColor()}
    >
      {method.toUpperCase()}
    </Badge>
  )
}
