import type { UserResponseWithToken, UserResponse } from "@/app/services/user.service"

export const auth = async (login: string, password: string): Promise<UserResponseWithToken & ApiResponseError> => {
  const response = await fetch("/backend/auth", {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({ login, password })
  })
  const data = await response.json()
  return data.user ? data.user : data
}

export const checkToken = async (token: string): Promise<UserResponse & ApiResponseError> => {
  const response = await fetch(`/backend/auth?token=${token}`)
  const data = await response.json()
  return data.user ? data.user : data
}
