import { redirect } from "react-router"
import * as v from "valibot"
import { Homepage } from "~/components/homepage"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { HomepageServerData } from "~/valibot-types"
import type { Route } from "./+types/home-splat"

export function meta({ location }: Route.MetaArgs) {
  return [
    {
      title: "Peterbe.com - Stuff in Peter's head",
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
  const { "*": splat } = params

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
      if (isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 })
      }
      continue
    } else if (/oc-[\w+]+/.test(part)) {
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
