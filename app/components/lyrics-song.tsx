import { Fragment, useEffect, useState } from "react"
import { useLocation } from "react-router"

import type { LyricsSong as LyricsSongT } from "~/valibot-types"

import { useSendPageview } from "../analytics"
import { CarbonAd } from "./carbonad"

const PREFIX = "/plog/blogitem-040601-1"

type Props = {
  song: LyricsSongT
}
export function LyricsSong({ song }: Props) {
  useSendPageview()

  const pageTitle = `${song.name}`

  return (
    <div className="lyrics-song" id="main-content">
      <div className="head-grid-container">
        <div>
          <hgroup>
            <h1>{pageTitle}</h1>
            <h2 style={{ fontSize: "1.2rem" }}>
              By <b>{song.artist.name}</b> {song.year && `(${song.year})`}
              <br />
              {song.albums?.length ? (
                <>
                  On album{" "}
                  {song.albums.map((album, i, arr) => (
                    <Fragment key={album.name}>
                      <b>{album.name}</b> {album.year && `(${album.year})`}
                      {i === arr.length - 1 ? " " : ", "}
                    </Fragment>
                  ))}
                </>
              ) : (
                <i>Album not known</i>
              )}
            </h2>
            <Back />
          </hgroup>
        </div>
        <div>
          <CarbonAd />
        </div>
      </div>

      <div>
        {song.image && (
          <img
            src={song.image.url}
            alt={song.image.name}
            className="song-text-image"
          />
        )}
        <div
          dangerouslySetInnerHTML={{ __html: song.text_html }}
          style={{ marginBottom: 50 }}
        />

        <Back />

        <Credit />
      </div>
    </div>
  )
}

function Credit() {
  return (
    <p style={{ marginTop: 100 }}>
      <small>
        Showing search results from <a href="https://songsear.ch">SongSearch</a>
      </small>
    </p>
  )
}

function Back() {
  const location = useLocation()
  const [search, setSearch] = useState("")
  useEffect(() => {
    if (location.hash.startsWith("#search=")) {
      const search = new URLSearchParams(location.hash.slice(1)).get("search")
      if (search) {
        setSearch(search)
      }
    }
  }, [location.hash])

  return (
    <div style={{ padding: 20 }}>
      <p>
        <a href={PREFIX}>Go back to main blog post</a>{" "}
        {search && (
          <>
            Go back to your search for:{" "}
            <a
              href={`${PREFIX}/q/${encodeURIComponent(search)}`}
              style={{ fontStyle: "italic" }}
            >
              "{search}"
            </a>
          </>
        )}
      </p>
      <p>
        Not the right song?{" "}
        <a href={`${PREFIX}#commentsform`}>Post your comment for help</a>
      </p>
    </div>
  )
}
