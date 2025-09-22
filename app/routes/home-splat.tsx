import { data, redirect } from "react-router"
import * as v from "valibot"
import { Homepage } from "~/components/homepage"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { HomepageServerData } from "~/valibot-types"
import stylesheet from "../styles/home.scss?url"
import type { Route } from "./+types/home-splat"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export function meta(args: Route.MetaArgs) {
  const { location, data } = args
  if (!data) return // When returning a 404

  let title = "Peterbe.com"
  if (data.categories.length) {
    title = `${data.categories.join(", ")} only on Peterbe.com`
    if (data.page && data.page !== 1) {
      title += ` - page ${data.page}`
    }
  } else {
    if (data.page && data.page !== 1) {
      title += ` - page ${data.page}`
    } else {
      title += " - Stuff in Peter's head"
    }
  }

  return [
    {
      title,
    },
    {
      name: "description",
      content:
        "Peterbe.com is the personal website and blog of Peter Bengtsson.",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
  ]
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders
}

export async function loader({ params }: Route.LoaderArgs) {
  const splat = params["*"] || ""

  let page = 1
  const categories: string[] = []

  for (const part of splat.split("/")) {
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
      continue
    }
    if (/oc-[\w+]+/.test(part)) {
      const matched = part.match(/oc-([\w.+]+)/)
      if (matched) {
        const category = matched[1].replace(/\+/g, " ")
        categories.push(category)
        continue
      }
    }
    throw new Response(`Invalid splat part (${part})`, { status: 404 })
  }

  const sp = new URLSearchParams({ page: `${page}`, size: "15" })
  categories.forEach((category) => {
    sp.append("oc", category)
  })
  const url = `/api/v1/plog/homepage?${sp}`
  const response = await get(url, { followRedirect: false })

  if (response.status === 404 || response.status === 400) {
    const headers = new Headers({
      "cache-control": "public, max-age=300",
    })
    return new Response(null, { status: 404, headers })
  }
  if (response.status === 301 && response.headers.location) {
    return redirect(response.headers.location, 308)
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${url}`)
  }
  try {
    const {
      posts,
      next_page: nextPage,
      previous_page: previousPage,
      max_next_page: maxNextPage,
    } = v.parse(HomepageServerData, response.data)
    return data(
      { categories, posts, nextPage, previousPage, page, maxNextPage },
      { headers: cacheHeaders(60 * 60) },
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

export default function Component({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return // When returning a 404

  if (loaderData instanceof Response) {
    return loaderData
  }
  if (loaderData instanceof Error) {
    return <pre>{loaderData.message}</pre>
  }
  const { page, posts, categories, nextPage, previousPage, maxNextPage } =
    loaderData

  return (
    <Homepage
      posts={posts}
      categories={categories}
      nextPage={nextPage}
      previousPage={previousPage}
      page={page}
      maxNextPage={maxNextPage}
    />
  )
}
