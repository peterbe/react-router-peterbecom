import { data } from "react-router"

import * as v from "valibot"
import { Blogcomment } from "~/components/blogcomment"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { CommentServerData, type Post } from "~/valibot-types"
import stylesheet from "../styles/plog.scss?url"
import type { Route } from "./+types/plog-comment"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export async function loader({ params }: Route.LoaderArgs) {
  const oid = params.oid
  const commentoid = params.commentoid
  if (!oid) {
    throw new Response("Not Found (no oid)", { status: 404 })
  }
  if (!commentoid) {
    throw new Response("Not Found (no commentoid)", { status: 404 })
  }

  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}/comment/${encodeURIComponent(commentoid)}`

  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { post, replies, page, comment, parent } = v.parse(
      CommentServerData,
      response.data,
    )

    // const cacheSeconds =
    //   post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12
    const cacheSeconds = comment.not_approved ? 0 : 60 * 60 * 12

    return data(
      { post, replies, page, comment, parent },
      { headers: cacheHeaders(cacheSeconds) },
    )
  } catch (error) {
    throw newValiError(error)
  }
}

// function isNotPublished(date: string) {
//   const actualDate = new Date(date)
//   return actualDate > new Date()
// }

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` }
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders
}

export function meta({ params, location, data }: Route.MetaArgs) {
  // export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const oid = params.oid
  if (!oid) throw new Error("No oid")
  const commentoid = params.commentoid
  if (!commentoid) throw new Error("No commentoid")

  if (!data) {
    // In catch CatchBoundary
    return [{ title: "Page not found" }]
  }

  let pageTitle = `Comment on "${data.post.title}"`

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
      content: `https://www.peterbe.com/plog/${oid}/comment/${data.comment.oid}`,
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
  const { post, replies, page, comment, parent } = loaderData
  return (
    <Blogcomment
      post={post as Post}
      comment={comment}
      comments={replies}
      parentComment={parent}
      page={page}
    />
  )
}
