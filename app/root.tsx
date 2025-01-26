import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"
import Rollbar from "rollbar"

import type { Route } from "./+types/root"
import { Footer } from "./components/footer"
import { Screensaver } from "./components/screensaver"
import { SkipToNav } from "./components/skip-to-nav"
import stylesheet from "./styles/root.css?url"

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

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export default function App() {
  return <Outlet />
}

export async function loader({ request }: Route.LoaderArgs) {
  return { url: request.url }
}

export function ErrorBoundary({
  error,
  loaderData,
  params,
}: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  // This'll be true on the server and false on the client
  if (process.env.ROLLBAR_ACCESS_TOKEN) {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    })
    const context = {
      params,
      url: "",
    }
    if (loaderData) {
      const { url } = loaderData
      context.url = url
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
  } else {
    // console.log("ERROR HAPPENEDD IN THE CLIENT")
  }

  return (
    <div>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </div>
  )
}
