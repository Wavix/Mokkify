// Pattern paths support ":param" segments and a trailing "*" wildcard,
// e.g. "v1/users/:id" or "v1/files/*". Paths are stored without a leading slash.

export const isPatternPath = (path: string): boolean => {
  return path.includes(":") || path.includes("*")
}

export const matchPatternPath = (pattern: string, path: string): Record<string, string> | null => {
  const patternSegments = pattern.split("/").filter(Boolean)
  const pathSegments = path.split("/").filter(Boolean)
  const params: Record<string, string> = {}

  for (let i = 0; i < patternSegments.length; i += 1) {
    const segment = patternSegments[i]

    if (segment === "*") {
      const rest = pathSegments.slice(i)
      if (!rest.length) return null
      params.wildcard = rest.join("/")
      return params
    }

    const pathSegment = pathSegments[i]
    if (pathSegment === undefined) return null

    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decodeURIComponent(pathSegment)
      continue
    }

    if (segment !== pathSegment) return null
  }

  if (patternSegments.length !== pathSegments.length) return null
  return params
}

// Higher score wins: static segments beat params, wildcards match last
export const patternSpecificity = (pattern: string): number => {
  return pattern
    .split("/")
    .filter(Boolean)
    .reduce((score, segment) => {
      if (segment === "*") return score - 100
      if (segment.startsWith(":")) return score + 1
      return score + 3
    }, 0)
}
