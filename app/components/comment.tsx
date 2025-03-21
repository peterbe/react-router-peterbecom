import type { ReactNode } from "react"

import type { Comment } from "~/types"
import { formatDateBasic } from "~/utils/utils"

export function DisplayComment({
  comment,
  children,
  disallowComments,
  notApproved,
  setParent,
  parent,
  toggleEditMode,
  allowReply,
}: {
  comment: Comment
  children?: ReactNode | null
  disallowComments: boolean
  notApproved: boolean
  setParent: (oid: string | null) => void
  parent: string | null
  toggleEditMode?: () => void
  allowReply?: boolean
}) {
  let className = "comment"
  if (comment.depth) {
    className += ` nested d-${comment.depth}`
  }
  return (
    <div id={comment.oid} className={className}>
      <b>{comment.name ? comment.name : <i>Anonymous</i>}</b>{" "}
      <a className="metadata" href={`#${comment.oid}`} rel="nofollow">
        {formatDateBasic(comment.add_date)}
      </a>{" "}
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
