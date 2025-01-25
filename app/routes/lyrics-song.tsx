import { data, redirect } from "react-router"
import * as v from "valibot"

import { LyricsSong } from "~/components/lyrics-song"
import { LyricsSongError } from "~/components/lyrics-song-error"
import { get } from "~/lib/get-data"
// import global from "~/styles/build/global-lyricspost.css"
import { absoluteURL, newValiError } from "~/utils/utils"
import { ServerSongData } from "~/valibot-types"

import type { Route } from "./+types/lyrics-song"
export { ErrorBoundary } from "../root"

import stylesheet from "../styles/lyrics-song.css?url"

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

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

  const sp = new URLSearchParams({ id: parts[2] })
  const fetchURL = `/api/v1/lyrics/song?${sp}`
  const response = await get(fetchURL)

  if (response.status === 404) {
    const error = "Song not found"
    return data({ error, song: undefined }, { headers: cacheHeaders(60) })
  }
  if (response.status === 400) {
    let error = "Song lookup error"
    if ("error" in response.data) {
      error = response.data.error
      if (typeof error === "object") {
        error = JSON.stringify(error)
      }
    }
    return data({ error, song: undefined }, { headers: cacheHeaders(60) })
  }
  if (response.status !== 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`)
    throw new Error(`${response.status} from ${fetchURL}`)
  }
  try {
    const { song } = v.parse(ServerSongData, response.data)
    const cacheSeconds = 60 * 60 * 12
    return data(
      { song, error: undefined },
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
  if (data.error) {
    return [{ title: data.error || "Page not found" }]
  }
  // if (!data || "error" in data) {
  //   return [{ title: (data && data.error) || "Page not found" }]
  // }
  if (!data.song) {
    throw new Error("weird")
  }

  const { song } = data
  const title = `"${song.name}" by "${song.artist.name}" - Find song by lyrics`
  const description = `Lyrics for "${song.name}" by "${song.artist.name}"`
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
      content: description,
    },
  ]
}

export default function Component({ loaderData }: Route.ComponentProps) {
  if (loaderData.error) {
    const { error } = loaderData
    return <LyricsSongError error={error} />
  }

  const { song } = loaderData
  if (!song) {
    throw new Error("no song")
  }
  return <LyricsSong song={song} />
}
