import { useEffect } from "react"
import { useLocation } from "react-router"

import { parseUserAgent } from "./user-agent"

function uuidv4(): string {
  try {
    return crypto.randomUUID()
  } catch {
    // https://stackoverflow.com/a/2117523
    // biome-ignore lint/suspicious/noExplicitAny: doesn't really matter
    return (<any>[1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: number) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    )
  }
}

type Data = Record<string, string | number>

let previousReferrer = ""
function getReferrer(documentReferrer: string) {
  if (
    !documentReferrer &&
    previousReferrer &&
    location.href !== previousReferrer
  ) {
    return previousReferrer
  }
  return documentReferrer === location.href ? "" : documentReferrer
}

export function sendEvent(type: string, data: Data) {
  try {
    let uuid = localStorage.getItem("uuid")
    if (!uuid || typeof uuid !== "string") {
      uuid = uuidv4()
      localStorage.setItem("uuid", uuid)
    }
    let sid = sessionStorage.getItem("sid")
    if (!sid || typeof sid !== "string") {
      sid = uuidv4()
      sessionStorage.setItem("sid", sid)
    }

    const meta = {
      uuid,
      sid,
      url: location.href,
      referrer: getReferrer(document.referrer),
      created: new Date().toISOString(),
      // performance: getPerformance(),
      user_agent: parseUserAgent(),
    }
    previousReferrer = location.href

    const blob = new Blob(
      [
        JSON.stringify({
          type,
          data,
          meta,
        }),
      ],
      {
        type: "application/json",
      },
    )
    navigator.sendBeacon("/events", blob)
  } catch (err) {
    console.warn("sendBeacon failed", err)
  }
}

export function useSendPageview(extra: object | null = null) {
  const { pathname } = useLocation()

  useEffect(() => {
    sendEvent("pageview", Object.assign({}, { pathname }, extra))
  }, [pathname, extra])
}

export function useSearchResults({
  q,
  count,
}: {
  q: string | null
  count: number | null
}) {
  useEffect(() => {
    if (q && count !== null) {
      sendEvent("search", { q, count })
    }
  }, [q, count])
}

export function useSendError(errorMessage: string) {
  const { pathname } = useLocation()

  useEffect(() => {
    sendEvent("error", Object.assign({}, { pathname }, { errorMessage }))
  }, [pathname, errorMessage])
}
