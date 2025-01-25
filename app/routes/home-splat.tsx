import { redirect } from "react-router"
import * as v from "valibot"
import { Homepage } from "~/components/homepage"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { HomepageServerData } from "~/valibot-types"
import type { Route } from "./+types/home-splat"

import stylesheet from "../styles/home.css?url"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export function meta({ location, data }: Route.MetaArgs) {
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

export function headers() {
  const seconds = 60 * 60
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
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
      page = Number.parseInt(part.replace("p", ""))
      if (Number.isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 })
      }
      continue
    }
    if (/oc-[\w+]+/.test(part)) {
      const matched = part.match(/oc-([\w\.\+]+)/)
      if (matched) {
        const category = matched[1].replace(/\+/g, " ")
        categories.push(category)
        continue
      }
    }
    throw new Response(`Invalid splat part (${part})`, { status: 404 })
  }

  const sp = new URLSearchParams({ page: `${page}`, size: "10" })
  categories.forEach((category) => sp.append("oc", category))
  const url = `/api/v1/plog/homepage?${sp}`
  const response = await get(url, { followRedirect: false })

  if (response.status === 404 || response.status === 400) {
    throw new Response("Not Found", { status: 404 })
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
    } = v.parse(HomepageServerData, response.data)
    return { categories, posts, nextPage, previousPage, page }
  } catch (error) {
    throw newValiError(error)
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  if (loaderData instanceof Response) {
    return loaderData
  }
  if (loaderData instanceof Error) {
    return <pre>{loaderData.message}</pre>
  }
  const { page, posts, categories, nextPage, previousPage } = loaderData

  return (
    <Homepage
      posts={posts}
      categories={categories}
      nextPage={nextPage}
      previousPage={previousPage}
      page={page}
    />
  )
}
