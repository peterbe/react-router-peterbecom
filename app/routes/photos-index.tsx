import { redirect } from "react-router"
import * as v from "valibot"
import { PhotosArchive } from "../components/photosarchive"
import { get } from "../lib/get-data"
import stylesheet from "../styles/photos-index.scss?url"
import { absoluteURL } from "../utils/utils"
import { IndexServerData } from "../valibot-types"
import type { Route } from "./+types/plog-index"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export function meta({ location }: Route.MetaArgs) {
  return [
    {
      title: "Photos - Peterbe.com",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
  ]
}

export function headers() {
  const seconds = 60 * 60 * 12
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const { pathname } = new URL(request.url)
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1))
  }
  const sp = new URLSearchParams({ is_photo: "true" })
  const fetchURL = `/api/v1/plog/?${sp}`
  const response = await get(fetchURL)
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { groups } = v.parse(IndexServerData, response.data)
    return { groups }
  } catch (error) {
    if (v.isValiError(error)) {
      const issue = error.issues[0]
      if (issue.path)
        console.error(
          `Validation issue in ${issue.path.map((p) => p.key).join(".")}`,
        )
    }
    throw error
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  if (loaderData instanceof Response) {
    return loaderData
  }
  if (loaderData instanceof Error) {
    return <pre>{loaderData.message}</pre>
  }
  const { groups } = loaderData

  return <PhotosArchive groups={groups} />
}
