import { useRouter } from "next/router"
import { useContext } from "react"

import { LoginContext } from "@/ui//LoginContext"

import { MenuButton } from "./MenuButton"
import { HomeIcon, TemplatesIcon, LogoutIcon, RelayIcon } from "./icons"
import style from "./style.module.scss"

import type { FC } from "react"

enum Section {
  Endpoints = "endpoints",
  Templates = "templates",
  Relay = "relays",
  Stats = "stats"
}

export const Sidebar: FC = () => {
  const router = useRouter()
  const { onLoginStateChange } = useContext(LoginContext)

  const currentSection = router.asPath.split("/")[1] || ""

  const logOut = () => {
    onLoginStateChange(false)
    localStorage.removeItem("auth_jwt")
    router.push("/login")
  }

  return (
    <div className={style.sidebar}>
      <MenuButton title="Home" icon={<HomeIcon />} href="/endpoints" active={currentSection === Section.Endpoints} />
      <MenuButton
        title="Templates"
        icon={<TemplatesIcon />}
        href="/templates"
        active={currentSection === Section.Templates}
      />
      <MenuButton title="Relay" icon={<RelayIcon />} href="/relays" active={currentSection === Section.Relay} />
      {/* <MenuButton title="Stats" icon={<StatsIcon />} href="/endpoints" active={currentSection === Section.Stats} /> */}
      <MenuButton title="Logout" icon={<LogoutIcon />} active={currentSection === Section.Stats} onClick={logOut} />
    </div>
  )
}
