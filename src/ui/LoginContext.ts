import { createContext } from "react"

export const LoginContext = createContext({
  /* eslint-disable-next-line */
  onLoginStateChange: (isLoginState: boolean) => {}
})
