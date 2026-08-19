import { DB } from "../database"

import type { EndpointAttributes } from "../database/interfaces/endpoint.interface"

const store = new Map<string, EndpointAttributes>()
let patternList: Array<EndpointAttributes> | null = null

export class CacheService {
  public set(endpointPath: string, method: string, payload: EndpointAttributes) {
    store.set(this.key(endpointPath, method), payload)
  }

  public async get(endpointPath: string, method: string): Promise<EndpointAttributes | null> {
    return store.get(this.key(endpointPath, method)) || null
  }

  public async delete(endpointId: number) {
    patternList = null
    const endpoint = await DB.models.Endpoint.findOne({ where: { id: endpointId } })
    if (!endpoint?.path) return

    store.delete(this.key(endpoint.path, endpoint.method))
  }

  public async clear() {
    store.clear()
    patternList = null
  }

  public getPatternList(): Array<EndpointAttributes> | null {
    return patternList
  }

  public setPatternList(list: Array<EndpointAttributes>) {
    patternList = list
  }

  private key(endpointPath: string, method: string): string {
    const endpointPathWithoutSlash = endpointPath.startsWith("/") ? endpointPath.substring(1) : endpointPath
    return `${endpointPathWithoutSlash}-${method}`
  }
}
