import { Link } from "react-router"
import { formatDateBasic } from "~/utils/utils"
import type { CommentType, Post } from "~/valibot-types"

export function HighlightedComments({
  post,
  comments,
}: {
  post: Post
  comments?: CommentType[]
}) {
  if (!comments || comments.length === 0) {
    return null
  }
  return (
    <article className="highlighted-comments">
      <h3>Highlighted Comment{comments.length === 1 ? "" : "s"} ✨</h3>
      {comments.map((comment) => {
        return (
          <HighlightedComment key={comment.oid} post={post} comment={comment} />
        )
      })}
    </article>
  )
}

function HighlightedComment({
  post,
  comment,
}: {
  post: Post
  comment: CommentType
}) {
  const commentUrl = `/plog/${post.oid}/comment/${comment.oid}`
  return (
    <div>
      <p>
        On{" "}
        <Link
          className="metadata"
          to={commentUrl}
          rel="nofollow"
          discover="none"
        >
          {formatDateBasic(comment.add_date)}
        </Link>
        , {comment.name ? <b>{comment.name}</b> : <i>Anonymous</i>} wrote:
      </p>
      <p dangerouslySetInnerHTML={{ __html: comment.comment }} />

      {comment.depth > 0 && (
        <p>
          <i>
            <small>This is a reply to another comment.</small>
          </i>
        </p>
      )}
    </div>
  )
}
