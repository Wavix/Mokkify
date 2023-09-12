import classNames from "classnames"

import style from "./style.module.scss"

import type { FC, KeyboardEvent } from "react"

interface Props {
  text: string
  disabled?: boolean
  onClick: () => void
}

export const Button: FC<Props> = ({ text, disabled, onClick }) => {
  const onClickHandler = () => {
    if (disabled) return
    onClick()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
    event.preventDefault()
    if (event.key === "Enter" || event.key === " ") onClickHandler()
  }

  return (
    <div
      className={classNames(style.button, { [style.disabled]: disabled })}
      role="button"
      tabIndex={0}
      onClick={onClickHandler}
      onKeyDown={onKeyDown}
    >
      <div className={style.text}>{text}</div>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <g clipPath="url(#clip0_17_2657)">
          <path
            d="M5.418 16L11.756 9.65333C12.1921 9.21519 12.4369 8.62218 12.4369 8.004C12.4369 7.38582 12.1921 6.79281 11.756 6.35467L5.41067 0L4 1.414L10.3453 7.768C10.4078 7.83051 10.4429 7.91528 10.4429 8.00367C10.4429 8.09205 10.4078 8.17682 10.3453 8.23933L4.00667 14.586L5.418 16Z"
            fill="#8BC6F0"
          />
        </g>
        <defs>
          <clipPath id="clip0_17_2657">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
