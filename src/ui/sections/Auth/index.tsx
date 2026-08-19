import { Loader2 } from "lucide-react"
import Head from "next/head"
import { useState, useContext } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginContext } from "@/ui/LoginContext"
import * as API from "@/ui/api/user"
import { Logo } from "@/ui/components"

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
      <div className="bg-background relative flex min-h-full flex-col items-center justify-center overflow-hidden p-4">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_40%,transparent_100%)]" />
          <div className="bg-foreground/[0.03] absolute -top-32 left-1/2 h-[300px] w-[620px] -translate-x-1/2 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-[380px]">
          <div className="text-foreground flex justify-center pb-8">
            <Logo />
          </div>

          <div className="bg-card border-border rounded-xl border p-7 shadow-sm">
            <h1 className="text-foreground text-lg font-semibold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground mt-1 text-[13px]">Enter your credentials to access your workspace</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={onFormSubmit}>
              <div className="grid gap-1.5">
                <Label htmlFor="login" className="text-[13px]">
                  Login
                </Label>
                <Input
                  id="login"
                  type="text"
                  autoFocus
                  autoComplete="username"
                  value={login}
                  data-id="auth.login"
                  onChange={e => setLogin(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-[13px]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  data-id="auth.password"
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading} data-id="auth.submit">
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Continue
              </Button>
            </form>

            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            <a
              href="https://mokkify.dev"
              target="_blank"
              rel="noreferrer"
              data-id="auth.siteLink"
              className="hover:text-foreground transition-colors"
            >
              mokkify.dev
            </a>
            <span className="px-1.5">·</span>v{version}
          </p>
        </div>
      </div>
    </>
  )
}

export default Auth
