import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

import { DB } from "../database"

import { config } from "@/config"

import type { UserCreationAttributes } from "@/app/database/interfaces/user.interface"

export interface UserResponse {
  id: number
  login: string
}

export interface UserResponseWithToken extends UserResponse {
  token: string
}

export class UserService {
  private saltRounds = 10

  public async addUser(login: string, password: string): Promise<UserCreationAttributes | Error> {
    try {
      const hashedPassword = await this.getHashedPassword(password)
      const exists = await DB.models.User.findOne({ where: { login } })
      if (exists?.id) throw new Error("User already exists")

      const response = await DB.models.User.create({ login, password: hashedPassword })
      return response.toJSON()
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  public async auth(login: string, password: string): Promise<UserResponseWithToken | Error> {
    try {
      const user = await DB.models.User.findOne({ where: { login } })
      if (!user) throw new Error("Wrong login or password")

      const isPasswordMatch = await bcrypt.compare(password, user.password)
      if (!isPasswordMatch) throw new Error("Wrong login or password")
      const token = await this.generateToken({ id: user.id, login: user.login })

      return {
        id: user.id,
        login: user.login,
        token
      }
    } catch {
      throw new Error("Wrong login or password")
    }
  }

  public async checkToken(token: string): Promise<UserResponse | Error> {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(config.jwtSecret))
      if (!payload?.id) throw new Error("Jwt payload is empty")

      const user = await DB.models.User.findOne({ where: { id: payload.id } })
      if (!user) throw new Error("User not found")

      return {
        id: user.id,
        login: user.login
      }
    } catch {
      throw new Error("Wrong token")
    }
  }

  private async getHashedPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds)
  }

  private generateToken = (payload: UserResponse) => {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(config.jwtSecret))
  }
}
