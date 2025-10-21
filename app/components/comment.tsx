import type { ReactNode } from "react"
import { Link } from "react-router"

import type { Comment } from "~/types"
import { formatDateBasic } from "~/utils/utils"
import type { Post } from "~/valibot-types"

export function DisplayComment({
  comment,
  children,
  disallowComments,
  notApproved,
  setParent,
  parent,
  toggleEditMode,
  allowReply,
  post,
}: {
  comment: Comment
  children?: ReactNode | null
  disallowComments: boolean
  notApproved: boolean
  setParent: (oid: string | null) => void
  parent: string | null
  toggleEditMode?: () => void
  allowReply?: boolean
  post: Post
}) {
  let className = "comment"
  if (comment.depth) {
    className += ` nested d-${comment.depth}`
  }
  const commentUrl = `/plog/${post.oid}/comment/${comment.oid}`
  return (
    <div id={comment.oid} className={className}>
      <b>{comment.name ? comment.name : <i>Anonymous</i>}</b>{" "}
      {comment.not_approved ? (
        <i>{formatDateBasic(comment.add_date)}</i>
      ) : (
        <Link
          className="metadata"
          to={commentUrl}
          rel="nofollow"
          discover="none"
        >
          {formatDateBasic(comment.add_date)}
        </Link>
      )}{" "}
      {toggleEditMode && (
        <button
          type="button"
          className="mini edit-comment"
          onClick={(event) => {
            event.preventDefault()
            toggleEditMode()
          }}
        >
          Edit comment
        </button>
      )}
      {!disallowComments && allowReply && !toggleEditMode && (
        <button
          type="button"
          className="mini reply-comment"
          onClick={(event) => {
            event.preventDefault()
            if (parent && parent === comment.oid) {
              setParent(null)
            } else {
              setParent(comment.oid)
            }
          }}
        >
          {parent && parent === comment.oid ? "Cancel reply" : "Reply"}
        </button>
      )}{" "}
      {notApproved && (
        <span className="not-approved">
          <b>Note:</b> All comments have to be approved first
        </span>
      )}
      <p dangerouslySetInnerHTML={{ __html: comment.comment }} />
      {children}
    </div>
  )
}
