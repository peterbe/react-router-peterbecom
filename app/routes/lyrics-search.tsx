import { data, redirect } from "react-router"

import * as v from "valibot"
import { LyricsSearch } from "~/components/lyrics-search"
import { LyricsSearchError } from "~/components/lyrics-search-error"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { ServerSearchData } from "~/valibot-types"
import type { Route } from "./+types/lyrics-search"

// export { ErrorBoundary } from "../root"

import stylesheet from "../styles/lyrics-search.css?url"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

const OID = "/plog/blogitem-040601-1"

export async function loader({ params, request }: Route.LoaderArgs) {
  const { pathname } = new URL(request.url)
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1))
  }
  if (pathname.endsWith("/p1")) {
    return redirect(pathname.slice(0, -3))
  }
  const dynamicPage = params["*"] || ""
  const parts = dynamicPage.split("/")
  if (parts.length > 1) {
    return redirect(OID, 308)
  }

  let page = 1

  let search = ""
  for (const part of parts) {
    if (!part) {
      // Because in JS,
      // > "".split('/')
      // [ '' ]
      continue
    }
    if (part === "q") {
      continue
    }
    if (/^p\d+$/.test(part)) {
      page = Number.parseInt(part.replace("p", ""))
      if (Number.isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 })
      }
      continue
    }
    search = part
  }

  const sp = new URLSearchParams({ page: `${page}` })
  if (!search) {
    return redirect(OID, 308)
  }
  sp.append("q", search)
  const fetchURL = `/api/v1/lyrics/search?${sp}`
  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status === 400) {
    let error = "Backend search failed"
    if ("error" in response.data) {
      error = response.data.error
      if (typeof error === "object") {
        error = JSON.stringify(error)
      }
    }
    return data({ search, error }, { headers: cacheHeaders(60) })
  }
  if (response.status !== 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`)
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { results, metadata } = v.parse(ServerSearchData, response.data)
    const cacheSeconds = 60 * 60 * 12
    return data(
      { results, metadata, page },
      { headers: cacheHeaders(cacheSeconds) },
    )
  } catch (error) {
    throw newValiError(error)
  }
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` }
}

export function meta({ location, data }: Route.MetaArgs) {
  if (data && "error" in data) {
    return [{ title: "Search error" }]
  }
  const pageTitle = "Find song by lyrics"
  const page = data?.page || 1
  // The contents of the `<title>` has to be a string
  let title = `${pageTitle} ${
    page > 1 ? ` (Page ${page})` : " Looking for songs by the lyrics"
  }`
  let description = "Find songs by lyrics."

  const { pathname } = location

  if (pathname.includes("/search/") && data && "metadata" in data) {
    const { metadata } = data
    title = `"${metadata.search}" ${
      page > 1 ? ` (page ${page}) ` : ""
    }- ${pageTitle}`
    description = `Searching for song lyrics by "${metadata.search}"`
  }

  return [
    { title },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:description",
      content:
        "You can find the song if you only know parts of the song's lyrics.",
    },
  ]
}

export default function Component({ loaderData }: Route.ComponentProps) {
  if ("error" in loaderData) {
    const { error, search } = loaderData
    return (
      <LyricsSearchError error={error as string} search={search as string} />
    )
  }
  const { results, metadata, page } = loaderData
  return <LyricsSearch results={results} metadata={metadata} page={page} />
}
