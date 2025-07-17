import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"
import Rollbar from "rollbar"

import type { Route } from "./+types/root"
import { Footer } from "./components/footer"
import { Screensaver } from "./components/screensaver"
import { SkipToNav } from "./components/skip-to-nav"
import stylesheet from "./styles/error.scss?url"

const screensaverLazyStartSeconds = import.meta.env
  .VITE_SCREENSAVER_LAZY_START_SECONDS
  ? Number.parseInt(import.meta.env.VITE_SCREENSAVER_LAZY_START_SECONDS)
  : 60 * 30 // 30 minutes by default

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.manifest" />
        <Meta />
        <Links />
      </head>
      <body>
        <SkipToNav />
        <main className="container">{children}</main>

        <Footer />
        <Screensaver lazyStartSeconds={screensaverLazyStartSeconds} />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export async function loader(args: Route.LoaderArgs) {
  const { request } = args
  return { url: request.url, method: request.method }
}

export function meta(args: Route.MetaArgs) {
  const { error } = args

  // At this point, `isRouteErrorResponse(error)` could be used to figure
  // out if it was a 404 or a 5xx. At the time of writing, it's the same
  // CSS for either error.
  if (error) {
    return [{ tagName: "link", rel: "stylesheet", href: stylesheet }]
  }
  return []
}

export function ErrorBoundary({
  error,
  loaderData,
  params,
}: Route.ErrorBoundaryProps) {
  let message = "Internal Server Error"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  let is4xx = false
  if (isRouteErrorResponse(error)) {
    is4xx = error.status >= 404 && error.status < 500
    message = error.status === 404 ? "404 Page Not Found" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  if (
    !is4xx &&
    typeof process !== "undefined" &&
    import.meta.env.PROD &&
    process.env.ROLLBAR_ACCESS_TOKEN &&
    !JSON.parse(process.env.CI || "false")
  ) {
    console.warn("Sending error (%s) to Rollbar", message)

    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    })
    const context = {
      params,
      url: "",
      method: "",
    }
    if (loaderData) {
      const { url, method } = loaderData
      context.url = url
      context.method = method
    }

    const { uuid } = rollbar.error(
      error instanceof Error ? error : new Error("Unknown error"),
      {
        context,
      },
    )
    if (uuid) {
      console.warn(
        `ErrorBoundary: Sent Rollbar error https://rollbar.com/occurrence/uuid/?uuid=${uuid}`,
      )
    }
  }
  const lyricsPage = Boolean(
    loaderData?.url &&
      new URL(loaderData.url).pathname.startsWith("/plog/blogitem-040601-1"),
  )

  return (
    <div>
      <hgroup>
        <h1>{message}</h1>
        <p>{details}</p>
      </hgroup>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
      <p>
        {lyricsPage ? (
          <a href="/plog/blogitem-040601-1">
            Go back to the <b>Find song by lyrics</b> page
          </a>
        ) : (
          <a href="/">Go back to the home page</a>
        )}
      </p>
    </div>
  )
}
