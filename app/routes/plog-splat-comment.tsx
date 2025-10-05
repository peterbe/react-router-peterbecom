import { data } from "react-router"
import * as v from "valibot"
import { Blogpost } from "~/components/blogpost"
import { get } from "~/lib/get-data"
import { newValiError } from "~/utils/utils"

// import Component from "./plog-splat"
import { ServerData } from "~/valibot-types"
import type { Route } from "./+types/plog-splat-comment"

export { headers, links, meta } from "./plog-splat"

export async function loader({ params }: Route.LoaderArgs) {
  const page = 1

  const oid = params.oid
  const commentoid = params.commentoid

  const sp = new URLSearchParams({ comment: commentoid })
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`

  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { post, comments, comment } = v.parse(ServerData, response.data)

    const cacheSeconds =
      post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12

    return data(
      { post, comments, page, comment },
      { headers: cacheHeaders(cacheSeconds) },
    )
  } catch (error) {
    throw newValiError(error)
  }
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` }
}

function isNotPublished(date: string) {
  const actualDate = new Date(date)
  return actualDate > new Date()
}

// export default Component

export default function Component({ loaderData }: Route.ComponentProps) {
  const { post, comments, page, comment } = loaderData
  return (
    <Blogpost post={post} comments={comments} page={page} comment={comment} />
  )
}
