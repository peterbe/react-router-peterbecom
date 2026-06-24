import { Fragment } from "react"
// import { Link } from "react-router"

import { useSendPageview } from "../analytics"
import type { Group } from "../types"
import { postURL } from "../utils/utils"

import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"

type Props = {
  groups: Group[]
  photos: boolean
}

// const intl = new Intl.NumberFormat("en-us")

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

              {chunk(posts, 4).map((posts, i) => {
                return (
                  <div className="grid" key={posts.map((p) => p.oid).join("-")}>
                    {posts.map((post) => {
                      // const count = `${intl.format(post.comments)} comment${
                      //   post.comments === 1 ? "" : "s"
                      // }`
                      if (!post.open_graph_image) return null

                      const webpURL = `/api/v1/plog/${post.oid}.webp`
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

                          <picture>
                            <source srcSet={webpURL} type="image/webp" />
                            <LinkWithPrefetching
                              to={postURL(post.oid, undefined, undefined, true)}
                              discover="none"
                            >
                              <img
                                src={post.open_graph_image}
                                alt={post.title}
                              />
                            </LinkWithPrefetching>
                          </picture>
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
