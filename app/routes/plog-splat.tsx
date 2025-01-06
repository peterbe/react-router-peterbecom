import * as v from "valibot"
import { Blogpost } from "~/components/blogpost"
import { get } from "~/lib/get-data"
import { absoluteURL, newValiError } from "~/utils/utils"
import { ServerData } from "~/valibot-types"
import type { Route } from "./+types/plog-splat"

// type LoaderDataType = ServerDataType;
export function meta({ params, location, data }: Route.MetaArgs) {
  // const oid = params["*"]?.split("/")[0];
  const oid = params["oid"]
  if (!oid) throw new Error("No oid")

  if (!data) {
    // In catch CatchBoundary
    return [{ title: "Page not found" }]
  }

  let pageTitle = ""

  //   const d = data as ServerDataType;
  const d = data

  pageTitle = d.post.title

  if (d.page > 1) {
    pageTitle += ` (page ${d.page})`
  }
  pageTitle += " - Peterbe.com"

  const summary = d.post.summary || undefined
  const openGraphImage = d.post.open_graph_image
    ? absoluteURL(d.post.open_graph_image)
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

    // Twitter uses 'name', OpenGraph uses 'property'
    { name: "twitter:creator", content: "@peterbe" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: summary },

    { name: "description", content: summary },
    { name: "twitter:image", content: openGraphImage },
    { property: "og:image", content: openGraphImage },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
  ]
  return tags.filter((o) => Object.values(o).every((x) => x !== undefined))
}

export async function loader({ params, request }: Route.LoaderArgs) {
  let page = 1
  const oid = params["oid"] as string
  const p = params["*"]
  if (p && /^p\d+$/.test(p)) {
    page = Number.parseInt(p.replace("p", ""))
    if (isNaN(page)) {
      throw new Response("Not Found (page not valid)", { status: 404 })
    }
  }

  const sp = new URLSearchParams({ page: `${page}` })
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`

  const response = await get(fetchURL)
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 })
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    // console.log("DATA", response.data);
    // console.log("SERVERDATA", ServerData);

    const { post, comments } = v.parse(ServerData, response.data)

    const cacheSeconds =
      post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12

    return { post, comments, page }
  } catch (error) {
    throw newValiError(error)
  }
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
  //   if (loaderData instanceof Response) {
  //     return loaderData;
  //   }
  //   if (loaderData instanceof Error) {
  //     return <pre>{loaderData.message}</pre>;
  //   }
  const { post, comments, page } = loaderData //useLoaderData<typeof loader>();
  //   const { post, comments, page } = loaderData as LoaderDataType;
  return <Blogpost post={post} comments={comments} page={page} />
}
