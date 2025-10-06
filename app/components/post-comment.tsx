import { useState } from "react"
import { useNavigate } from "react-router"
import type { AddOwnCommentProps, Comment, OwnComment } from "~/types"
import type { Post } from "~/valibot-types"
import { DisplayComment } from "./comment"
import { CommentForm } from "./commentform"
import { DisplayOwnComment } from "./display-own-comment"

type Props = {
  comment: Comment
  post: Post
  page: number
}

export function PostComment({ comment, post, page }: Props) {
  const disallowComments = post.disallow_comments
  const navigate = useNavigate()

  const [parent, setParent] = useState<string | null>(null)

  const [ownComments, setOwnComments] = useState<OwnComment[]>([])
  // const { ownComments, addNewComment } = useOwnComments()

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
    // const newComment: OwnComment = {
    //   oid,
    //   hash,
    //   renderedComment,
    //   comment,
    //   name,
    //   email,
    //   parent,
    //   depth,
    //   postOid: post.oid,
    // }
    // addNewComment(newComment)
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
  function exitModal() {
    const url = getPaginationURL(post.oid, page, comment.oid)
    navigate(url)
  }

  return (
    <div>
      <dialog open>
        {/* <DebugOwnComments /> */}
        <article>
          <header>
            <button
              type="button"
              aria-label="Close"
              rel="prev"
              onClick={() => exitModal()}
              style={{ marginTop: 10 }}
            />
            <h3>Comment</h3>
          </header>

          <DisplayComment
            comment={comment}
            disallowComments={disallowComments}
            notApproved={false}
            setParent={() => {}}
            parent={null}
            permalink={false}
          >
            {ownComments
              .filter((c) => c.parent === comment.oid && c.postOid === post.oid)
              .map((ownComment) => {
                return (
                  <DisplayOwnComment
                    key={ownComment.oid}
                    ownComment={ownComment}
                    addOwnComment={addOwnComment}
                    post={post}
                    permalink={false}
                    setParent={setParent}
                  />
                )
              })}

            {!disallowComments && !parent && (
              <CommentForm
                parent={comment.oid}
                post={post}
                addOwnComment={addOwnComment}
                setParent={() => {}}
                depth={comment.depth + 1}
                onSubmitted={() => {
                  // setSubmitted(comment.oid)
                  console.warn("onSubmitted not implemented")
                }}
                commentLabel="Your reply"
              />
            )}
          </DisplayComment>
          <footer>
            <button
              type="button"
              className="secondary"
              onClick={() => exitModal()}
            >
              All comments
            </button>
          </footer>
        </article>
      </dialog>
    </div>
  )
}

function getPaginationURL(oid: string, page: number, commentOid: string) {
  let start = `/plog/${oid}`
  if (page !== 1) {
    start += `/p${page}`
  }
  return `${start}#${commentOid}`
}
