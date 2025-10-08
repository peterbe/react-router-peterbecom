import { data, redirect } from "react-router"

import * as v from "valibot"
import { Blogpost } from "~/components/blogpost"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { ServerData } from "~/valibot-types"
import stylesheet from "../styles/plog.scss?url"
import type { Route } from "./+types/plog-splat"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export async function loader({ params, request }: Route.LoaderArgs) {
  let page = 1
  const url = new URL(request.url, "https://www.peterbe.com")
  if (url.pathname.endsWith("/")) {
    return redirect(url.pathname.slice(0, -1) + url.search, { status: 302 })
  }
  if (url.pathname.endsWith("/p1")) {
    return redirect(url.pathname.slice(0, -3) + url.search, { status: 302 })
  }

  const oid = params.oid
  const p = params["*"]
  if (p) {
    if (/^p\d+$/.test(p)) {
      page = Number.parseInt(p.replace("p", ""), 10)
      if (Number.isNaN(page)) {
        throw data("Not Found (page not valid)", { status: 404 })
      }
    } else {
      throw new Response(`Unrecognized excess splat ('${p}')`, {
        status: 404,
        statusText: "Not found",
        // This does not appear to work annoyingly!
        headers: cacheHeaders(60),
      })
    }
  }

  const permaComment = url.searchParams.get("comment")

  const sp = new URLSearchParams({ page: `${page}` })
  if (permaComment) {
    sp.append("comment", permaComment)
  }
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`

  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { post, comments } = v.parse(ServerData, response.data)

    const cacheSeconds =
      post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12

    return data(
      { post, comments, page },
      { headers: cacheHeaders(cacheSeconds) },
    )
  } catch (error) {
    throw newValiError(error)
  }
}

function isNotPublished(date: string) {
  const actualDate = new Date(date)
  return actualDate > new Date()
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` }
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders
}

export function meta({ params, location, data }: Route.MetaArgs) {
  const oid = params.oid
  if (!oid) throw new Error("No oid")

  if (!data) {
    // In catch CatchBoundary
    return [{ title: "Page not found" }]
  }

  let pageTitle = ""

  pageTitle = data.post.title

  if (data.page > 1) {
    pageTitle += ` (page ${data.page})`
  }
  pageTitle += " - Peterbe.com"

  const summary = data.post.summary || undefined
  const openGraphImage = data.post.open_graph_image
    ? absoluteURL(data.post.open_graph_image)
    : undefined
  const tags = [
    { title: pageTitle },
    {
      property: "og:url",
      content: `https://www.peterbe.com/plog/${oid}`,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    { property: "og:description", content: summary },
    { name: "description", content: summary },
    { property: "og:image", content: openGraphImage },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
  ]
  return tags.filter((o) => Object.values(o).every((x) => x !== undefined))
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { post, comments, page } = loaderData
  return <Blogpost post={post} comments={comments} page={page} />
}
