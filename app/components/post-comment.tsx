import { useNavigate } from "react-router"
import type { Comment } from "~/types"

import type { Post } from "~/valibot-types"
import { DisplayComment } from "./comment"

type Props = {
  comment: Comment
  post: Post
  page: number
}

export function PostComment({ comment, post, page }: Props) {
  const navigate = useNavigate()
  return (
    <div>
      <dialog open>
        <article>
          <h2>Comment</h2>
          <DisplayComment
            comment={comment}
            disallowComments={true}
            notApproved={false}
            setParent={() => {}}
            parent={null}
          >
            ...
          </DisplayComment>
          <footer>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                const url = getPaginationURL(post.oid, page)
                navigate(url)
              }}
            >
              All comments
            </button>
          </footer>
        </article>
      </dialog>
    </div>
  )
}

function getPaginationURL(oid: string, page: number) {
  let start = `/plog/${oid}`
  if (page !== 1) {
    start += `/p${page}`
  }
  return start
}
