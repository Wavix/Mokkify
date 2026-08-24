import { randomBytes } from "node:crypto"

import bcrypt from "bcryptjs"

import { DB } from "../database"

import type { ApiKeyAttributes } from "@/app/database/interfaces/api-key.interface"

const KEY_ID_BYTES = 8
const SECRET_BYTES = 32
const SALT_ROUNDS = 10
const LAST_USED_THROTTLE_MS = 60_000

export type ApiKeyPublicAttributes = Omit<ApiKeyAttributes, "secret_hash">

export interface ApiKeyCreated {
  plaintext: string
  key: ApiKeyPublicAttributes
}

export class ApiKeyService {
  public async createKey(name: string): Promise<ApiKeyCreated> {
    const { key_id, secret } = this.generate()
    const secret_hash = await bcrypt.hash(secret, SALT_ROUNDS)

    const row = await DB.models.ApiKey.create({ key_id, name, secret_hash })
    return {
      plaintext: `${key_id}.${secret}`,
      key: this.toPublic(row.toJSON())
    }
  }

  public async list(): Promise<Array<ApiKeyPublicAttributes>> {
    const rows = await DB.models.ApiKey.findAll({ order: [["created_at", "DESC"]] })
    return rows.map(row => this.toPublic(row.toJSON()))
  }

  public async revoke(id: number): Promise<void> {
    await DB.models.ApiKey.destroy({ where: { id } })
  }

  public async setActive(id: number, isActive: boolean): Promise<void> {
    await DB.models.ApiKey.update({ is_active: isActive }, { where: { id } })
  }

  public async verify(presented: string): Promise<boolean> {
    const parts = presented.split(".")
    if (parts.length !== 2) return false
    const [key_id, secret] = parts
    if (!key_id || !secret) return false

    const row = await DB.models.ApiKey.findOne({ where: { key_id, is_active: true } })
    if (!row) return false

    const isMatch = await bcrypt.compare(secret, row.secret_hash)
    if (!isMatch) return false

    const last = row.last_used_at ? new Date(row.last_used_at).getTime() : 0
    if (Date.now() - last > LAST_USED_THROTTLE_MS) await row.update({ last_used_at: new Date() })
    return true
  }

  private generate(): { key_id: string; secret: string } {
    return {
      key_id: randomBytes(KEY_ID_BYTES).toString("hex"),
      secret: randomBytes(SECRET_BYTES).toString("hex")
    }
  }

  private toPublic(key: ApiKeyAttributes): ApiKeyPublicAttributes {
    return {
      id: key.id,
      key_id: key.key_id,
      name: key.name,
      is_active: key.is_active,
      last_used_at: key.last_used_at,
      created_at: key.created_at
    }
  }
}
