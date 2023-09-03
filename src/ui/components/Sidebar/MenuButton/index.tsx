import classNames from "classnames"
import { useRouter } from "next/router"

import style from "./style.module.scss"

import type { FC } from "react"

interface Props {
  icon: JSX.Element
  title: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export const MenuButton: FC<Props> = ({ icon, href, title, active, onClick }) => {
  const router = useRouter()

  const onClickHandler = () => {
    if (href) router.push(href, undefined, { shallow: true })
    if (onClick) onClick()
  }

  return (
    <div className={classNames(style.menuButtonWrapper, { [style.active]: active })} onClick={onClickHandler}>
      <div className={style.menuButtonIconWrapper}>{icon}</div>
      <div className={style.menuButtonTitle}>{title}</div>
    </div>
  )
}
