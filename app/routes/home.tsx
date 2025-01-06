import { Homepage } from "~/components/homepage"
import { absoluteURL } from "~/utils/utils"
import type { Route } from "./+types/home-splat"

export { loader } from "./home-splat"

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
