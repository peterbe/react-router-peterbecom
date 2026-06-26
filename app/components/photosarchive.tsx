import { Fragment } from "react"

import { useSendPageview } from "../analytics"
import type { Group } from "../types"
import { postURL } from "../utils/utils"

import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"

type Props = {
  groups: Group[]
}

export function PhotosArchive({ groups }: Props) {
  useSendPageview()
  return (
    <div>
      <Nav title="Photos" />

      <div id="main-content" className="photos-archive">
        {groups.map(({ date, posts }) => {
          return (
            <Fragment key={date}>
              <h3>{formatDateShort(date)}</h3>

              {chunk(posts, 4).map((posts) => {
                return (
                  <div className="grid" key={posts.map((p) => p.oid).join("-")}>
                    {posts.map((post) => {
                      const webpURL = `/api/v1/plog/${post.oid}.w400.webp`
                      const pngURL = `/api/v1/plog/${post.oid}.w400.png`
                      return (
                        <article key={post.oid} className="photo">
                          <header>
                            <LinkWithPrefetching
                              to={postURL(post.oid, undefined, undefined, true)}
                              discover="none"
                            >
                              {post.title}
                            </LinkWithPrefetching>
                          </header>
                          <LinkWithPrefetching
                            to={postURL(post.oid, undefined, undefined, true)}
                            discover="none"
                          >
                            <picture>
                              <source srcSet={webpURL} type="image/webp" />

                              <img src={pngURL} alt={post.title} />
                            </picture>
                          </LinkWithPrefetching>
                        </article>
                      )
                    })}
                  </div>
                )
              })}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// The date string here is of the format "YYYY.MM"
// From that format it as "May 2023"
function formatDateShort(date: string) {
  const split = date.split(".")
  if (split.length !== 2) {
    return date
  }
  const [year, month] = split
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const monthNumber = Number.parseInt(month, 10)
  if (monthNames[monthNumber - 1]) {
    return `${monthNames[monthNumber - 1]} ${year}`
  }
  return `${month} ${year}`
}
