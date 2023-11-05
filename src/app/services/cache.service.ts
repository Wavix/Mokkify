import Cache from "file-system-cache"

import { DB } from "../database"

import type { EndpointAttributes } from "../database/interfaces/endpoint.interface"

const cache = Cache({ basePath: ".cache" })

export class CacheService {
  public set(endpointPath: string, method: string, payload: unknown) {
    const key = this.key(endpointPath, method)
    cache.set(key, payload)
  }

  public async get(endpointPath: string, method: string): Promise<EndpointAttributes | null> {
    const key = this.key(endpointPath, method)
    const cacheData = await cache.get(key)
    return cacheData || null
  }

  public async delete(endpointId: number) {
    const endpoint = await DB.models.Endpoint.findOne({ where: { id: endpointId } })
    if (!endpoint?.path) return

    const key = this.key(endpoint.path, endpoint.method)
    await cache.remove(key)
  }

  public async clear() {
    await cache.clear()
  }

  private key(endpointPath: string, method: string): string {
    const endpointPathWithoutSlash = endpointPath.startsWith("/") ? endpointPath.substring(1) : endpointPath
    return `${endpointPathWithoutSlash}-${method}`
  }
}
