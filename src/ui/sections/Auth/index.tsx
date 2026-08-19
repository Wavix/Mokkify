import { KeyRound, Loader2, User } from "lucide-react"
import Head from "next/head"
import { useState, useContext } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginContext } from "@/ui/LoginContext"
import * as API from "@/ui/api/user"
import { Logo } from "@/ui/components"

import { Lines } from "./Lines"

import type { NextPage } from "next"

const Auth: NextPage = () => {
  const isDemo = document.URL.includes("demo.mokkify")

  const { onLoginStateChange } = useContext(LoginContext)

  const [login, setLogin] = useState(isDemo ? "admin" : "")
  const [password, setPassword] = useState(isDemo ? "admin" : "")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const version = process.env.NEXT_PUBLIC_APP_VERSION

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    auth()
  }

  const auth = async () => {
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const response = await API.auth(login, password)
      if (response?.error) return setErrorMessage(response.error)
      localStorage.setItem("auth_jwt", response.token)
      onLoginStateChange(true)
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Mokkify - Welcome!</title>
      </Head>
      <div className="relative flex min-h-full items-center justify-center bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 p-4 dark:from-violet-950 dark:via-neutral-950 dark:to-fuchsia-950">
        <div className="bg-card grid w-full max-w-[820px] overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">
          <div className="relative hidden flex-col overflow-hidden bg-violet-950 p-9 text-white md:flex dark:bg-violet-950/60">
            <Logo />
            <div className="mt-auto pb-10">
              <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-violet-200">Sign in to manage your mocks, templates and relays</p>
            </div>
            <a
              href="https://mokkify.dev"
              target="_blank"
              rel="noreferrer"
              data-id="auth.siteLink"
              className="relative z-10 text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              www.mokkify.dev
            </a>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-60">
              <Lines />
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-10">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter your credentials to continue</p>

            <form className="mt-8 flex flex-col gap-5" onSubmit={onFormSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="login">Login</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="login"
                    type="text"
                    placeholder="login"
                    autoFocus
                    className="pl-9"
                    value={login}
                    data-id="auth.login"
                    onChange={e => setLogin(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="password"
                    className="pl-9"
                    value={password}
                    data-id="auth.password"
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-1 w-full" disabled={isLoading} data-id="auth.submit">
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Continue
              </Button>
            </form>

            {errorMessage && (
              <Alert variant="destructive" className="mt-5">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 left-4 text-xs text-white/50">v{version}</div>
      </div>
    </>
  )
}

export default Auth
