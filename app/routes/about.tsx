import { redirect } from "react-router"
import { About } from "~/components/about"
import styles from "~/styles/about.css?url"
import { absoluteURL } from "~/utils/utils"
import type { Route } from "./+types/plog-index"

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "canonical", href: absoluteURL("/about") },
  ]
}
export async function loader({ request }: Route.LoaderArgs) {
  const { pathname } = new URL(request.url)
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1))
  }
}
export function meta() {
  return [
    {
      title: "About Peterbe.com",
    },
    {
      name: "description",
      content:
        "My name is Peter Bengtsson and I'm a web developer. This is my personal blog.",
    },
  ]
}
export function headers() {
  const seconds = 60 * 60 * 12
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export default function Component() {
  return <About />
}
