import type { CommentType } from "~/valibot-types"

export function recursiveGetHighlightedComments(comments: CommentType[]) {
  const here: CommentType[] = []
  for (const comment of comments) {
    if (comment.highlighted) {
      here.push(comment)
    }
    if (comment.replies) {
      here.push(...recursiveGetHighlightedComments(comment.replies))
    }
  }

  return here
}
