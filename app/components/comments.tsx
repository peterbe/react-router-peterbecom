import { useState } from "react"
import { Link } from "react-router"

import type { Comments } from "~/types"
import type { Post } from "~/valibot-types"
import { ShowCommentTree } from "./comment-tree"
import { ScrollToTop } from "./scroll-to-top"

type Props = {
  post: Post
  comments: Comments
  page: number
}
export function PostComments({ post, comments, page }: Props) {
  const disallowComments = post.disallow_comments
  const hideComments = post.hide_comments
  const [parent, setParent] = useState<string | null>(null)
  // The `comments.total_pages` was introduced late.
  // Once we know the CDN is properly purged this can be assumed to
  // always be present.
  const totalPages = comments.total_pages
    ? comments.total_pages
    : comments.truncated && comments.truncated !== true
      ? Math.ceil(comments.count / comments.truncated)
      : 1

  if (hideComments && disallowComments) {
    return (
      <p>
        <em>Comments closed for this page</em>
      </p>
    )
  }

  return (
    <div id="comments">
      <div style={{ marginBottom: 30 }}>
        <Heading
          page={page}
          totalPages={totalPages}
          oid={post.oid}
          nextPage={comments.next_page}
          prevPage={comments.previous_page}
        />

        {!disallowComments && comments.count > 5 && <PostOwnComment />}
      </div>

      {hideComments && comments.count && (
        <p>
          <em>Comments hidden. Sorry.</em>
        </p>
      )}
      {!hideComments && (
        <div id="comments-outer" className="comments">
          <ShowCommentTree
            post={post}
            comments={comments.tree}
            disallowComments={disallowComments}
            setParent={setParent}
            parent={parent}
          />
        </div>
      )}

      {disallowComments && (
        <p>
          <em>Comments closed</em>
        </p>
      )}

      <Footing
        page={page}
        totalPages={totalPages}
        oid={post.oid}
        nextPage={comments.next_page}
        prevPage={comments.previous_page}
      />
    </div>
  )
}

function PostOwnComment() {
  return (
    <a
      href="#commentsform"
      role="button"
      className="mini outline"
      style={{ marginLeft: 0 }}
      onClick={(event) => {
        const dest = document.querySelector<HTMLDivElement>("#commentsform")
        if (dest) {
          event.preventDefault()
          dest.scrollIntoView({ behavior: "smooth" })
          setTimeout(() => {
            const textarea = dest.querySelector<HTMLTextAreaElement>("textarea")
            if (textarea) textarea.focus()
          }, 1000)
        }
      }}
    >
      Post your own comment
    </a>
  )
}

function Heading({
  page,
  totalPages,
  oid,
  nextPage,
  prevPage,
}: {
  page: number
  totalPages: number
  oid: string
  nextPage: number | null
  prevPage: number | null
}) {
  if (totalPages === 1)
    return (
      <h2 style={{ marginBottom: 5 }}>
        <a href="#comments" className="toclink">
          Comments
        </a>
      </h2>
    )

  return (
    <div className="grid">
      <div>
        <hgroup style={{ marginBottom: 5 }}>
          <h2>
            <a href="#comments" className="toclink">
              Comments
            </a>
          </h2>
          <h3>
            Page {page} <span>of {totalPages}</span>
          </h3>
        </hgroup>
      </div>
      <div>
        {prevPage ? (
          <Link to={getPaginationURL(oid, prevPage)} className="mini">
            Page {prevPage}
          </Link>
        ) : (
          <a
            href={getPaginationURL(oid, 1)}
            onClick={(event) => event.preventDefault()}
            className="secondary outline mini"
            aria-disabled="true"
          >
            Page 1
          </a>
        )}
      </div>
      <div>
        {nextPage ? (
          <Link to={getPaginationURL(oid, nextPage)} className="mini">
            Page {nextPage}
          </Link>
        ) : (
          <a
            href={getPaginationURL(oid, page)}
            onClick={(event) => event.preventDefault()}
            className="secondary outline mini"
            aria-disabled="true"
          >
            Page {page}
          </a>
        )}
      </div>
    </div>
  )
}

function Footing({
  page,
  totalPages,
  oid,
  nextPage,
  prevPage,
}: {
  page: number
  totalPages: number
  oid: string
  nextPage: number | null
  prevPage: number | null
}) {
  if (totalPages === 1) {
    return null
  }

  return (
    <div className="grid" style={{ marginTop: 80 }}>
      <div style={{ textAlign: "center" }}>
        <ScrollToTop />
      </div>
      <div style={{ textAlign: "center" }}>
        {prevPage ? (
          <Link to={getPaginationURL(oid, prevPage)} className="mini">
            Page {prevPage}
          </Link>
        ) : (
          <a
            href={getPaginationURL(oid, 1)}
            onClick={(event) => event.preventDefault()}
            className="secondary outline mini"
            aria-disabled="true"
          >
            Page 1
          </a>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        {nextPage ? (
          <Link to={getPaginationURL(oid, nextPage)} className="mini">
            Page {nextPage}
          </Link>
        ) : (
          <a
            href={getPaginationURL(oid, page)}
            onClick={(event) => event.preventDefault()}
            className="secondary outline mini"
            aria-disabled="true"
          >
            Page {page}
          </a>
        )}
      </div>
    </div>
  )
}

function getPaginationURL(oid: string, page: number) {
  let start = `/plog/${oid}`
  if (page !== 1) {
    start += `/p${page}`
  }
  // return `${start}#comments`;
  return start
}
