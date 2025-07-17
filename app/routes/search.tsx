import { Search } from "~/components/search"
import styles from "~/styles/search.scss?url"
import { absoluteURL } from "~/utils/utils"
import type { Route } from "./+types/search"

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "canonical", href: absoluteURL("/search") },
  ]
}

export function meta({ data }: Route.MetaArgs) {
  const q = data?.q || null

  return [
    {
      title: q ? `Searching for "${q}"` : "Searching on Peterbe.com",
    },
  ]
}

export function headers() {
  const seconds = 60 * 60
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const { search } = new URL(request.url)
  const sp = new URLSearchParams(search)
  const q = sp.get("q")
  const debug = sp.get("debug") === "true" || sp.get("debug") === "1"

  return { q, debug }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <Search {...loaderData} />
}
