import { useState, useContext } from "react"

import { LoginContext } from "@/ui//LoginContext"
import * as API from "@/ui/api/user"
import { Logo } from "@/ui/components"

import { Button } from "./Button"
import { Input } from "./Input"
import { Lines } from "./Lines"
import style from "./style.module.scss"

import type { NextPage } from "next"

const Auth: NextPage = () => {
  const { onLoginStateChange } = useContext(LoginContext)

  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    auth()
  }

  const auth = async () => {
    setErrorMessage(null)

    try {
      const response = await API.auth(login, password)
      if (response?.error) return setErrorMessage(response.error)
      localStorage.setItem("auth_jwt", response.token)
      onLoginStateChange(true)
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  return (
    <>
      <title>Mokkify - Welcome!</title>
      <div className={style.authPage}>
        <div className={style.mainWindow}>
          <div className={style.mainWindowContainer}>
            <div className={style.left}>
              <div className={style.container}>
                <Logo />
                <div className={style.welcome}>Welcome Page</div>
                <div className={style.welcome2}>Sign in to continue access</div>
                <div className={style.link}>www.mokkify.dev</div>
              </div>
              <div className={style.lines}>
                <Lines />
              </div>
            </div>
            <div className={style.right}>
              <div className={style.container}>
                <h1>Sign In</h1>

                <form className={style.form} onSubmit={onFormSubmit}>
                  <Input type="text" placeHolder="login" value={login} focused onChange={value => setLogin(value)} />
                  <Input
                    type="password"
                    placeHolder="password"
                    value={password}
                    onChange={value => setPassword(value)}
                  />
                  <button type="submit">Submit</button>
                  <Button text="continue" onClick={auth} />
                </form>
                <div className={style.errorMessage}>{errorMessage}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Auth
