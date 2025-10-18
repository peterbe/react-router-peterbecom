import { Fragment, useEffect, useState } from "react"
import type { AddOwnCommentProps, Comment, OwnComment } from "~/types"
import { Message } from "~/utils/message"
import type { Post } from "~/valibot-types"
import { DisplayComment } from "./comment"
import { CommentForm } from "./commentform"

export function ShowCommentTree({
  post,
  comments,
  disallowComments,
  setParent,
  parent,
  root = true,
}: {
  post: Post
  comments: Comment[]
  disallowComments: boolean
  setParent: (oid: string | null) => void
  parent: string | null
  root?: boolean
}) {
  const [ownComments, setOwnComments] = useState<OwnComment[]>([])
  const [submitted, setSubmitted] = useState<string | boolean | null>(null)

  function addOwnComment({
    oid,
    renderedComment,
    hash,
    comment,
    name,
    email,
    depth,
    parent,
  }: AddOwnCommentProps) {
    setOwnComments((prevState) => {
      const newComments: OwnComment[] = []
      const newComment: OwnComment = {
        oid,
        hash,
        renderedComment,
        comment,
        name,
        email,
        parent,
        depth,
        postOid: post.oid,
      }
      let edited = false
      for (const ownComment of prevState) {
        if (ownComment.hash === hash) {
          newComments.push(newComment)
          edited = true
        } else {
          newComments.push(ownComment)
        }
      }
      if (!edited) {
        newComments.push(newComment)
      }
      return newComments
    })
  }

  useEffect(() => {
    let mounted = true
    if (submitted) {
      setTimeout(() => {
        if (mounted) {
          setSubmitted(null)
        }
      }, 5 * 1000)
    }
    return () => {
      mounted = false
    }
  }, [submitted])

  return (
    <>
      {comments.map((comment) => {
        return (
          <Fragment key={comment.id}>
            <DisplayComment
              comment={comment}
              disallowComments={disallowComments}
              setParent={setParent}
              notApproved={false}
              parent={parent}
              allowReply={true}
              post={post}
            >
              {submitted === comment.oid && (
                <Message
                  onClose={() => setSubmitted(null)}
                  header="Reply comment submitted"
                  positive={true}
                >
                  It will be manually reviewed shortly.
                </Message>
              )}
              {parent && parent === comment.oid && !disallowComments && (
                <CommentForm
                  parent={parent}
                  post={post}
                  addOwnComment={addOwnComment}
                  setParent={setParent}
                  depth={comment.depth + 1}
                  onSubmitted={() => {
                    setSubmitted(comment.oid)
                  }}
                />
              )}
            </DisplayComment>

            {comment.replies && (
              <ShowCommentTree
                post={post}
                comments={comment.replies}
                disallowComments={disallowComments}
                setParent={setParent}
                parent={parent}
                root={false}
              />
            )}

            {ownComments
              .filter((c) => c.parent === comment.oid && c.postOid === post.oid)
              .map((ownComment) => {
                return (
                  <DisplayOwnComment
                    key={ownComment.oid}
                    ownComment={ownComment}
                    addOwnComment={addOwnComment}
                    post={post}
                  />
                )
              })}
          </Fragment>
        )
      })}

      {submitted === true && (
        <Message
          onClose={() => setSubmitted(null)}
          header="Comment submitted"
          positive={true}
        >
          It will be manually reviewed shortly.
        </Message>
      )}

      {ownComments
        .filter((c) => c.parent === null && c.postOid === post.oid)
        .map((ownComment) => {
          return (
            <DisplayOwnComment
              key={ownComment.oid}
              ownComment={ownComment}
              addOwnComment={addOwnComment}
              post={post}
            />
          )
        })}

      {!parent && root && !disallowComments && (
        <div id="commentsform">
          <CommentForm
            parent={parent}
            post={post}
            addOwnComment={addOwnComment}
            setParent={setParent}
            depth={0}
            onSubmitted={() => {
              setSubmitted(true)
            }}
          />
        </div>
      )}
    </>
  )
}

function DisplayOwnComment({
  ownComment,
  addOwnComment,
  post,
}: {
  ownComment: OwnComment
  addOwnComment: (props: AddOwnCommentProps) => void
  post: Post
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
        setParent={() => {}}
        post={post}
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
      setParent={() => {}}
      parent={null}
      post={post}
      toggleEditMode={() => {
        setEditMode((prevState) => !prevState)
      }}
    />
  )
}
