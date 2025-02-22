import { absoluteURL } from "~/utils/utils"
import type { Route } from "./+types/plog-splat"

export function meta({ params, location, data }: Route.MetaArgs) {
  const oid = params["*"]?.split("/")[0]
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

function isNotPublished(date: string) {
  const actualDate = new Date(date)
  return actualDate > new Date()
}
export function headers() {
  // XXX This sould vary depending on isNotPublished
  const seconds = 60 * 60
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  throw new Error("Is this even used?")
  // if (loaderData instanceof Response) {
  //   return loaderData
  // }
  // if (loaderData instanceof Error) {
  //   return <pre>{loaderData.message}</pre>
  // }
  // const { post, comments, page } = loaderData
  // return <Blogpost post={post} comments={comments} page={page} />
}
