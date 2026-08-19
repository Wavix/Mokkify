import { ChartColumn, FileJson2, LogOut, Moon, Send, Settings, Sun, Waypoints } from "lucide-react"
import { useRouter } from "next/router"
import { useTheme } from "next-themes"
import { useContext, useEffect, useState } from "react"

import { LoginContext } from "@/ui/LoginContext"

import { MenuButton } from "./MenuButton"

import type { FC } from "react"

enum Section {
  Endpoints = "endpoints",
  Templates = "templates",
  Relay = "relays",
  Stats = "stats",
  Settings = "settings"
}

const ThemeToggle: FC = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [isMounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const icon = isMounted && resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />

  return <MenuButton title="Theme" icon={icon} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} />
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
    <div className="bg-rail fixed top-0 left-0 flex h-full w-[62px] flex-col items-center gap-1 pt-8 pb-4">
      <MenuButton
        title="Endpoints"
        icon={<Waypoints className="size-5" />}
        href="/endpoints"
        active={currentSection === Section.Endpoints}
      />
      <MenuButton
        title="Templates"
        icon={<FileJson2 className="size-5" />}
        href="/templates"
        active={currentSection === Section.Templates}
      />
      <MenuButton
        title="Relay"
        icon={<Send className="size-5" />}
        href="/relays"
        active={currentSection === Section.Relay}
      />
      <MenuButton
        title="Stats"
        icon={<ChartColumn className="size-5" />}
        href="/stats"
        active={currentSection === Section.Stats}
      />
      <MenuButton
        title="Settings"
        icon={<Settings className="size-5" />}
        href="/settings/general"
        active={currentSection === Section.Settings}
      />
      <div className="mt-auto">
        <ThemeToggle />
        <MenuButton title="Logout" icon={<LogOut className="size-5" />} onClick={logOut} />
      </div>
    </div>
  )
}
