import { Fragment } from "react"
import { Link } from "react-router"

import { useSendPageview } from "~/analytics"
import type { HomepagePost } from "~/types"
import { categoryURL, formatDateBasic, postURL } from "~/utils/utils"

import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"

type Props = {
  posts: HomepagePost[]
  categories: string[]
  nextPage: number | null
  previousPage: number | null
  page: number
}

export function Homepage({
  posts,
  categories,
  page,
  nextPage,
  previousPage,
}: Props) {
  useSendPageview()

  const showFilters = categories.length > 0 || page > 1
  const showSubtitle = page === 1 && !categories.length

  return (
    <div>
      <Nav title="Peterbe.com" />
      {showFilters && <AboutFilters categories={categories} page={page} />}

      <div id="main-content">
        {showSubtitle && (
          <hgroup className="subtitle">
            <h2>Most recent blog posts</h2>
            <p>Or you can click on the categories to filter by topic</p>
          </hgroup>
        )}
        {posts.map((post, i) => (
          <Post key={post.oid} post={post} index={i} />
        ))}
      </div>

      <Pagination
        categories={categories}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  )
}

function AboutFilters({
  page,
  categories,
}: {
  page: number
  categories: string[]
}) {
  if (categories.length || page > 0) {
    return (
      <article className="about-filters">
        <div className="grid">
          {categories.length > 0 && (
            <div>
              <p>
                Filtered by{" "}
                {categories.map((name, i, arr) => (
                  <Fragment key={name}>
                    <b>{name}</b>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                ))}{" "}
              </p>
            </div>
          )}
          <div>
            <p>{page > 1 && <span>Page {page}</span>}</p>
          </div>
          <div>
            <Link to="/">Reset</Link>
          </div>
        </div>
      </article>
    )
  }
  return null
}

function Post({ post, index }: { post: HomepagePost; index: number }) {
  const url = postURL(post.oid)
  const first = index < 1
  return (
    <article className="homepage-post">
      <hgroup>
        <h3>
          <LinkWithPrefetching to={url} instant={first}>
            {post.title}
          </LinkWithPrefetching>
        </h3>
        <h4>
          <b>{formatDateBasic(post.pub_date)}</b>
        </h4>
      </hgroup>
      <p
        style={{ color: "var(--pico-color)" }}
      >{`${post.comments} comment${post.comments === 1 ? "" : "s"}`}</p>
      <p>
        {post.categories.length === 1 ? "Category: " : "Categories: "}
        {post.categories.map((category, i, arr) => {
          return (
            <Fragment key={category}>
              <Link to={categoryURL(category)} rel="nofollow">
                {category}
              </Link>
              {i < arr.length - 1 ? ", " : ""}
            </Fragment>
          )
        })}
      </p>
    </article>
  )
}

function makeURL(page: number, categories: string[]) {
  let url = ""
  for (const category of categories) {
    url += `/oc-${category.replace(/\s/g, "+")}`
  }
  if (page && page !== 1) {
    url += `/p${page}`
  }
  return url || "/"
}

function Pagination({
  categories,
  nextPage,
  previousPage,
}: {
  categories: string[]
  nextPage: number | null
  previousPage: number | null
}) {
  return (
    <div className="grid next-previous">
      <div>
        {previousPage ? (
          <LinkWithPrefetching to={makeURL(previousPage, categories)}>
            Previous page
          </LinkWithPrefetching>
        ) : (
          <i>Previous page</i>
        )}
      </div>
      <div>
        {nextPage ? (
          <LinkWithPrefetching to={makeURL(nextPage, categories)}>
            Next page
          </LinkWithPrefetching>
        ) : (
          <i>Next page</i>
        )}
      </div>
    </div>
  )
}
