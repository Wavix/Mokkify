import React from "react"

import { Skeleton as ChakraSkeleton, Stack } from "@chakra-ui/react"

import type { FC } from "react"

interface Props {
  rows?: number
  height?: string
}

export const Skeleton: FC<Props> = ({ rows = 3, height = "40px" }) => {
  return (
    <Stack>
      {Array(rows)
        .fill(Number)
        .map((_, index) => (
          <ChakraSkeleton key={index} height={height} startColor="gray.100" endColor="gray.200" />
        ))}
    </Stack>
  )
}
