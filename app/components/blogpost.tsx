import { Fragment } from "react"
import { Link } from "react-router"

import { useSendPageview } from "../analytics"
import { categoryURL, formatDateBasic, postURL } from "../utils/utils"
import type { Comments, CommentType, Post } from "../valibot-types"

import { CarbonAd } from "./carbonad"
import { PostComments } from "./comments"
import { HighlightedComments } from "./highlighted-comments"
import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"
import { useRememberVisit } from "./remember-visit"
import { ScrollToTop } from "./scroll-to-top"

type Props = {
  post: Post
  comments: Comments
  page: number
  highlightedComments?: CommentType[]
  photo: boolean
}

export function Blogpost({
  post,
  comments,
  page,
  highlightedComments,
  photo,
}: Props) {
  useSendPageview()
  const pubDate = new Date(post.pub_date)

  useRememberVisit(post)
  const title = photo ? (
    <>
      <span className="photo-title-prefix">Photo:</span> {post.title}
    </>
  ) : (
    post.title
  )

  return (
    <div>
      <Nav
        title={title}
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

      <div id="main-content">
        {photo && <Photo post={post} />}
        {!photo && <div dangerouslySetInnerHTML={{ __html: post.body }} />}
      </div>

      <CarbonAd />

      {photo && <NextPreviousPhoto post={post} photo={photo} />}

      <HighlightedComments post={post} comments={highlightedComments} />

      <PostComments post={post} comments={comments} page={page} photo={photo} />

      {!photo && <RelatedPosts post={post} />}

      {comments.count >= 10 && <ScrollToTop />}
    </div>
  )
}

function Photo({ post }: { post: Post }) {
  const largeWebpURL = `/api/v1/plog/${post.oid}.w3000.webp`
  const webpURL = `/api/v1/plog/${post.oid}.webp`
  const pngURL = `/api/v1/plog/${post.oid}.png`
  return (
    <article className="photo">
      <a href={largeWebpURL}>
        <picture>
          <source srcSet={webpURL} type="image/webp" />
          <img src={pngURL} alt={post.title} />
        </picture>
      </a>
      {post.body && <footer dangerouslySetInnerHTML={{ __html: post.body }} />}
    </article>
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

function NextPreviousPhoto({ post, photo }: { post: Post; photo: boolean }) {
  const previousPost = post.previous_post
  const nextPost = post.next_post
  if (!nextPost && !previousPost) {
    return null
  }

  return (
    <div className="grid">
      {previousPost && (
        <div>
          Previous{" "}
          <LinkWithPrefetching
            to={postURL(previousPost.oid, undefined, undefined, photo)}
            discover="none"
          >
            {previousPost.title}
          </LinkWithPrefetching>{" "}
          <small>{formatDateBasic(previousPost.pub_date)}</small>
        </div>
      )}
      {nextPost && (
        <div style={{ textAlign: "right" }}>
          Next{" "}
          <LinkWithPrefetching
            to={postURL(nextPost.oid, undefined, undefined, photo)}
            discover="none"
          >
            {nextPost.title}
          </LinkWithPrefetching>{" "}
          <small>{formatDateBasic(nextPost.pub_date)}</small>
        </div>
      )}
    </div>
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
