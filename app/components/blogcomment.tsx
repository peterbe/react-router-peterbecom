import { useEffect, useState } from "react"
import { useSendPageview } from "~/analytics"
import type { AddOwnCommentProps, OwnComment } from "~/types"
import { Message } from "~/utils/message"
import { postURL } from "~/utils/utils"
import type { Comment, Comments, Post } from "~/valibot-types"
import { CarbonAd } from "./carbonad"
import { DisplayComment } from "./comment"
import { ShowCommentTree } from "./comment-tree"
import { CommentForm } from "./commentform"
import { LinkWithPrefetching } from "./link-with-prefetching"
import { Nav } from "./nav"
import { useRememberVisit } from "./remember-visit"

type Props = {
  post: Post
  page: number
  comment: Comment
  comments: Comments
  parentComment: Comment | null
}
export function Blogcomment({
  post,
  comments,
  comment,
  page,
  parentComment,
}: Props) {
  useSendPageview()
  const disallowComments = post.disallow_comments
  const pubDate = new Date(post.pub_date)

  const [parent, setParent] = useState<string | null>(null)

  const [ownComments, setOwnComments] = useState<OwnComment[]>([])
  const [submitted, setSubmitted] = useState<string | boolean | null>(null)

  useRememberVisit(post)

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
          </>
        }
      />

      <div id="main-content">
        <article>
          <p style={{ textAlign: "center" }}>
            ⬅︎ Back to blog post:
            <br />
            <LinkWithPrefetching to={postURL(post.oid, page, comment.oid)}>
              {post.title}
            </LinkWithPrefetching>
          </p>
        </article>

        <div id="comments">
          <h2>Comment</h2>
          <DisplayComment
            comment={comment}
            disallowComments={post.disallow_comments}
            notApproved={false}
            setParent={setParent}
            parent={parent}
            post={post}
            allowReply={!disallowComments}
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
                depth={comment.depth + 0}
                onSubmitted={() => {
                  setSubmitted(comment.oid)
                }}
              />
            )}
          </DisplayComment>
          {parentComment && <h3>Parent comment</h3>}
          {parentComment && (
            <DisplayComment
              comment={parentComment}
              disallowComments={post.disallow_comments}
              notApproved={false}
              setParent={setParent}
              parent={parent}
              post={post}
              // allowReply={!disallowComments}
              allowReply={false} // for now
            >
              {submitted === parentComment.oid && (
                <Message
                  onClose={() => setSubmitted(null)}
                  header="Reply comment submitted"
                  positive={true}
                >
                  It will be manually reviewed shortly.
                </Message>
              )}
              {parent && parent === parentComment.oid && !disallowComments && (
                <CommentForm
                  parent={parent}
                  post={post}
                  addOwnComment={addOwnComment}
                  setParent={setParent}
                  depth={parentComment.depth}
                  onSubmitted={() => {
                    setSubmitted(parentComment.oid)
                  }}
                />
              )}
            </DisplayComment>
          )}
          {comments.tree.length > 0 && <h3>Replies</h3>}

          <ShowCommentTree
            post={post}
            comments={comments.tree}
            disallowComments={disallowComments}
            setParent={setParent}
            parent={parent}
            root={false}
          />

          {ownComments
            //   .filter((c) => c.parent === comment.oid && c.postOid === post.oid)
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

          {disallowComments && (
            <p>
              <em>Further comments closed</em>
            </p>
          )}
        </div>
      </div>

      <CarbonAd />
    </div>
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
