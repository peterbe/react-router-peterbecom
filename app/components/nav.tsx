import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { ModalSearch } from "./modal-search"

type Props = {
  title?: string
  subHead?: string | ReactNode
}

export const links = [
  ["/", "Home"],
  ["/plog", "Archive"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/search", "Search"],
]

export function Nav({
  title = "Peterbe.com",
  subHead = "Peter Bengtsson's blog",
}: Props) {
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return
      }
      if (e.key === "/") {
        setOpen(true)
        e.preventDefault()
        return
      }
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])

  useEffect(() => {
    if (hash === "#main-search") {
      setOpen(true)
    }
  }, [hash])

  return (
    <div id="nav">
      <h1>{title}</h1>

      <div className="grid nav-grid">
        <div>
          <div>{subHead}</div>
        </div>
        <div>
          <nav id="main-nav">
            <ul>
              {links
                .filter(([to]) => {
                  if (to === "/" && pathname === "/") return false
                  return true
                })
                .map(([to, text]) => {
                  return (
                    <li key={to}>
                      <Link
                        viewTransition
                        to={to}
                        className={pathname === to ? "secondary" : undefined}
                        title={
                          to === "/search" ? `Shortcut key: '/'` : undefined
                        }
                        id={to === "/search" ? "main-search" : undefined}
                        onClick={(event) => {
                          if (to === "/search") {
                            event.preventDefault()
                            setOpen(true)
                          }
                        }}
                        prefetch="intent"
                      >
                        {text}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </nav>
        </div>
      </div>

      {open && (
        <ModalSearch
          onClose={(url?: string) => {
            if (url) {
              navigate(url)
            }
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
