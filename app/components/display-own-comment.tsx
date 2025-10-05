import { useState } from "react"
import type { AddOwnCommentProps, OwnComment } from "~/types"
import type { Post } from "~/valibot-types"
import { DisplayComment } from "./comment"
import { CommentForm } from "./commentform"

export function DisplayOwnComment({
  ownComment,
  addOwnComment,
  post,
  permalink,
  setParent,
}: {
  ownComment: OwnComment
  addOwnComment: (props: AddOwnCommentProps) => void
  post: Post
  permalink: boolean
  setParent: (oid: string | null) => void
}) {
  const [editMode, setEditMode] = useState(false)
  if (editMode) {
    return (
      <CommentForm
        editHash={ownComment.hash}
        parent={ownComment.parent}
        addOwnComment={addOwnComment}
        onSubmitted={() => {
          setEditMode(false)
        }}
        initialComment={ownComment.comment}
        initialName={ownComment.name}
        initialEmail={ownComment.email}
        depth={ownComment.depth}
        setParent={setParent}
        post={post}
        commentLabel="Edit your comment"
      />
    )
  }
  return (
    <DisplayComment
      key={ownComment.oid}
      comment={{
        id: 0,
        oid: ownComment.oid,
        comment: ownComment.renderedComment,
        add_date: new Date().toISOString(),
        not_approved: true,
        depth: ownComment.depth,
        name: ownComment.name,
      }}
      disallowComments={false}
      allowReply={false}
      notApproved={true}
      setParent={setParent}
      parent={null}
      toggleEditMode={() => {
        setEditMode((prevState) => !prevState)
        setParent(ownComment.oid)
      }}
      permalink={permalink}
    />
  )
}
