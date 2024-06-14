import { useRouter } from "next/router"
import { useContext } from "react"

import { LoginContext } from "@/ui/LoginContext"

import { MenuButton } from "./MenuButton"
import { HomeIcon, TemplatesIcon, LogoutIcon, RelayIcon, StatsIcon, SettingsIcon } from "./icons"
import style from "./style.module.scss"

import type { FC } from "react"

enum Section {
  Endpoints = "endpoints",
  Templates = "templates",
  Relay = "relays",
  Stats = "stats",
  Settings = "settings"
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
      <MenuButton
        title="Endpoints"
        icon={<HomeIcon />}
        href="/endpoints"
        active={currentSection === Section.Endpoints}
      />
      <MenuButton
        title="Templates"
        icon={<TemplatesIcon />}
        href="/templates"
        active={currentSection === Section.Templates}
      />
      <MenuButton title="Relay" icon={<RelayIcon />} href="/relays" active={currentSection === Section.Relay} />
      <MenuButton title="Stats" icon={<StatsIcon />} href="/stats" active={currentSection === Section.Stats} />
      <MenuButton
        title="Settings"
        icon={<SettingsIcon />}
        href="/settings"
        active={currentSection === Section.Settings}
      />
      <MenuButton title="Logout" icon={<LogoutIcon />} onClick={logOut} />
    </div>
  )
}
