import type { ReactNode } from "react"

type Props = {
  header: string | ReactNode
  body?: string | ReactNode
  onClose: () => void
  negative?: boolean
  positive?: boolean
  warning?: boolean
  children?: ReactNode
}
export function Message({
  header,
  body,
  onClose,
  negative = false,
  positive = false,
  warning = false,
  children = null,
}: Props) {
  let cls = "message"
  if (negative) cls += " negative"
  if (warning) cls += " warning"
  if (positive) cls += " positive"

  return (
    <article className={cls}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: I don't care */}
      <i
        className="close icon"
        onClick={() => onClose()}
        onKeyDown={() => onClose()}
      >
        &times;
      </i>
      <div className="header">
        {typeof header === "string" ? (
          <p>
            <b>{header}</b>
          </p>
        ) : (
          header
        )}
      </div>
      <div className="body">
        {body && typeof body === "string" ? <p>{body}</p> : body ? body : null}
        {children && children}
      </div>
    </article>
  )
}
