import { lazy, Suspense, useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useLocation } from "react-router"

const ConfettiLazy = lazy(
  // @ts-ignore
  () => import("~/components/confetti-screensaver"),
)
const CursorsLazy = lazy(
  // @ts-ignore
  () => import("~/components/cursors-screensaver"),
)

type Props = {
  lazyStartSeconds: number
}
export function Screensaver({ lazyStartSeconds }: Props) {
  const { pathname } = useLocation()
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return null
  }
  return <DelayedScreensaver lazyStartSeconds={lazyStartSeconds} />
}

function DelayedScreensaver({ lazyStartSeconds }: Props) {
  const [loadScreensaver, setLoadScreensaver] = useState(false)

  const [smallScreen, setSmallScreen] = useState(false)
  useEffect(() => {
    setSmallScreen(window.matchMedia("(max-width: 600px)").matches)
  }, [])

  useEffect(() => {
    const startWaiting = () => {
      return window.setTimeout(() => {
        setLoadScreensaver(true)
      }, lazyStartSeconds * 1000)
    }

    let timer = startWaiting()
    function restartWaiting() {
      window.clearTimeout(timer)
      timer = startWaiting()
    }
    let throttle = false
    function delayLazyStart() {
      if (!throttle) {
        restartWaiting()
        throttle = true
        setTimeout(() => {
          throttle = false
        }, 1000)
      }
    }

    window.addEventListener("scroll", delayLazyStart)
    return () => {
      window.removeEventListener("scroll", delayLazyStart)
    }
  }, [lazyStartSeconds])

  return (
    <div>
      {loadScreensaver && (
        <Suspense fallback={null}>
          <ErrorBoundary fallback={null}>
            {smallScreen ? <ConfettiLazy /> : <CursorsLazy />}
          </ErrorBoundary>
        </Suspense>
      )}
    </div>
  )
}
