import { data, redirect } from "react-router"
import * as v from "valibot"
import { Lyricspost } from "~/components/lyricspost"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { ServerData } from "~/valibot-types"
import type { Route } from "./+types/lyrics-post"

export { ErrorBoundary } from "../root"

import { recursiveGetHighlightedComments } from "~/utils/get-highlighted-comments"
import stylesheet from "../styles/lyrics-post.scss?url"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url, "https://www.peterbe.com")
  if (url.pathname.endsWith("/")) {
    return redirect(url.pathname.slice(0, -1) + url.search, { status: 302 })
  }
  if (url.pathname.endsWith("/p1")) {
    return redirect(url.pathname.slice(0, -3) + url.search, { status: 302 })
  }

  const dynamicPage = params["*"] || ""

  let page = 1
  const oid = "blogitem-040601-1"
  for (const part of dynamicPage.split("/")) {
    if (!part) {
      // Because in JS,
      // > "".split('/')
      // [ '' ]
      continue
    }
    if (/^p\d+$/.test(part)) {
      page = Number.parseInt(part.replace("p", ""), 10)
      if (Number.isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 })
      }
    } else {
      throw new Response("Not Found (extra path)", { status: 404 })
    }
  }

  const sp = new URLSearchParams({ page: `${page}` })
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`

  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status !== 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`)
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { post, comments } = v.parse(ServerData, response.data)
    const highlightedComments = recursiveGetHighlightedComments(comments.tree)
    const cacheSeconds = 60 * 60 * 12

    return data(
      { post, comments, page, highlightedComments },
      { headers: cacheHeaders(cacheSeconds) },
    )
  } catch (error) {
    throw newValiError(error)
  }
}
function cacheHeaders(seconds: number) {
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders
}

export function meta({ location, data }: Route.MetaArgs) {
  const pageTitle = "Find song by lyrics"
  const page = data?.page || 1

  // The contents of the `<title>` has to be a string
  let title = pageTitle
  if (page > 1) {
    title += ` (Page ${page})`
  }

  return [
    { title: title },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
    {
      name: "description",
      content:
        "You can find the song if you only know parts of the song's lyrics.",
    },
    {
      property: "og:description",
      content:
        "You can find the song if you only know parts of the song's lyrics.",
    },
  ]
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { post, comments, page, highlightedComments } = loaderData
  return (
    <Lyricspost
      post={post}
      comments={comments}
      page={page}
      highlightedComments={highlightedComments}
    />
  )
}
