import { useRouter } from "next/router"
import { useState, useEffect } from "react"

import { ChakraProvider } from "@chakra-ui/react"

import { LoginContext } from "@/ui/LoginContext"
import { checkToken } from "@/ui/api/user"
import { DefaultLayout } from "@/ui/components/layout"

import "../index.css"
import type { AppProps } from "next/app"

const UNAUTHENTICATED_ROUTES = ["/login"]

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  const [isLogin, setLoginIsLogin] = useState(false)
  const [isTokenChecked, setTokenChecked] = useState(false)

  const onChangeLoginState = (isLoginState: boolean) => {
    setLoginIsLogin(isLoginState)
  }

  const checkAuthTonken = async () => {
    const token = localStorage.getItem("auth_jwt")
    if (!token) return setTokenChecked(true)

    const response = await checkToken(token)
    if (response?.error) return setTokenChecked(true)

    setTokenChecked(true)
    onChangeLoginState(true)
  }

  useEffect(() => {
    if (!isLogin && isTokenChecked && !UNAUTHENTICATED_ROUTES.includes(router.pathname)) {
      router.push("/login")
    }
  }, [router.pathname, isTokenChecked, isLogin])

  useEffect(() => {
    if (isLogin && UNAUTHENTICATED_ROUTES.includes(router.pathname))
      router.push("/endpoints", undefined, { shallow: true })
  }, [isLogin])

  useEffect(() => {
    checkAuthTonken()
  }, [])

  if (!isTokenChecked) return null

  return (
    <ChakraProvider>
      <LoginContext.Provider value={{ onLoginStateChange: onChangeLoginState }}>
        {isLogin ? (
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </LoginContext.Provider>
    </ChakraProvider>
  )
}

export default MyApp
