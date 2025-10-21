import { Fragment } from "react"
import { Link } from "react-router"

import { useSendPageview } from "~/analytics"
import { categoryURL, formatDateBasic, postURL } from "~/utils/utils"
import type { Comments, Post } from "~/valibot-types"

import { CarbonAd } from "./carbonad"
import { PostComments } from "./comments"
import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"
import { useRememberVisit } from "./remember-visit"
import { ScrollToTop } from "./scroll-to-top"

type Props = {
  post: Post
  comments: Comments
  page: number
}
export function Blogpost({ post, comments, page }: Props) {
  useSendPageview()
  const pubDate = new Date(post.pub_date)

  useRememberVisit(post)

  return (
    <div>
      <Nav
        title={post.title}
        subHead={
          <>
            <b>
              {pubDate.toLocaleDateString("en-us", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC", // So that it doesn't matter where in the world you are, it's always UTC
              })}
            </b>
            <br />
            <span>
              {`${comments.count.toLocaleString()} comment${
                comments.count === 1 ? "" : "s"
              }`}
            </span>{" "}
            <span>
              {post.categories.map((category, i, arr) => {
                return (
                  <Fragment key={category}>
                    <LinkWithPrefetching
                      to={categoryURL(category)}
                      discover="none"
                    >
                      {category}
                    </LinkWithPrefetching>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                )
              })}
            </span>
          </>
        }
      />

      {post.url && <AboutPostURL url={post.url} />}

      <div id="main-content" dangerouslySetInnerHTML={{ __html: post.body }} />

      <CarbonAd />

      <PostComments post={post} comments={comments} page={page} />

      <RelatedPosts post={post} />

      {comments.count >= 10 && <ScrollToTop />}
    </div>
  )
}

function AboutPostURL({ url }: { url: string }) {
  return (
    <p className="post-url">
      <b>URL:</b>{" "}
      <a href={url} rel="nofollow">
        {url}
      </a>
    </p>
  )
}

function RelatedPosts({ post }: { post: Post }) {
  const previousPost = post.previous_post
  const nextPost = post.next_post
  const relatedByCategory = post.related_by_category || []
  const relatedByKeyword = post.related_by_keyword || []

  return (
    <>
      <h2 className="header" id="related-posts">
        <a href="#related-posts" className="toclink">
          Related posts
        </a>
      </h2>

      <dl>
        {previousPost && (
          <>
            <dt>Previous:</dt>
            <dd>
              <LinkWithPrefetching
                to={postURL(previousPost.oid)}
                discover="none"
              >
                {previousPost.title}
              </LinkWithPrefetching>{" "}
              <small>{formatDateBasic(previousPost.pub_date)}</small>{" "}
              <SubCategories categories={previousPost.categories || []} />
            </dd>
          </>
        )}

        {nextPost && (
          <>
            <dt>Next:</dt>
            <dd>
              <LinkWithPrefetching to={postURL(nextPost.oid)} discover="none">
                {nextPost.title}
              </LinkWithPrefetching>{" "}
              <small>{formatDateBasic(nextPost.pub_date)}</small>{" "}
              <SubCategories categories={nextPost.categories || []} />
            </dd>
          </>
        )}
      </dl>

      {relatedByCategory.length > 0 && (
        <dl>
          <dt>Related by category:</dt>
          {relatedByCategory.map((related) => (
            <dd key={related.oid}>
              <LinkWithPrefetching to={postURL(related.oid)} discover="none">
                {related.title}
              </LinkWithPrefetching>{" "}
              <small>{formatDateBasic(related.pub_date)}</small>{" "}
              <SubCategories categories={related.categories || []} />
            </dd>
          ))}
        </dl>
      )}

      {relatedByKeyword.length > 0 && (
        <dl>
          <dt>Related by keyword:</dt>
          {relatedByKeyword.map((related) => (
            <dd key={related.oid}>
              <LinkWithPrefetching to={postURL(related.oid)} discover="none">
                {related.title}
              </LinkWithPrefetching>{" "}
              <small>{formatDateBasic(related.pub_date)}</small>{" "}
              <SubCategories categories={related.categories || []} />
            </dd>
          ))}
        </dl>
      )}
    </>
  )
}

function SubCategories({ categories }: { categories: string[] }) {
  return (
    <>
      {categories.map((category, i) => (
        <Fragment key={category}>
          <Link to={categoryURL(category)} viewTransition discover="none">
            <small>{category}</small>
          </Link>
          {i < categories.length - 1 && <small>, </small>}
        </Fragment>
      ))}
    </>
  )
}
