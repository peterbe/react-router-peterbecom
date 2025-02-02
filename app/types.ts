interface RelatedPost {
  oid: string
  title: string
  pub_date: string
  categories?: string[]
}

export interface Post {
  oid: string
  title: string
  pub_date: string
  url: string | null
  categories: string[]
  summary: string
  open_graph_image: string
  archived?: boolean
  body: string
  hide_comments: boolean
  disallow_comments: boolean
  previous_post: RelatedPost | null
  next_post: RelatedPost | null
  related_by_category: RelatedPost[]
  related_by_keyword: RelatedPost[]
}

export interface Comment {
  id: number
  oid: string
  comment: string
  add_date: string
  not_approved?: boolean
  depth: number
  name: string | null
  replies?: Comment[]
  hash?: string
}

export interface Comments {
  truncated: boolean | number
  count: number
  next_page: number | null
  previous_page: number | null
  tree: Comment[]

  // The `comments.total_pages` was introduced late.
  // Once we know the CDN is properly purged this can be assumed to
  // always be present.
  total_pages?: number
}

export interface OwnComment {
  oid: string
  hash: string
  comment: string
  renderedComment: string
  name: string
  email: string
  parent: string | null
  depth: number
  postOid: string
}

export type AddOwnComment = (
  hash: string,
  renderedComment: string,
  comment: string,
  name: string,
  email: string,
  parent: string | null,
  depth: number,
) => void

export interface AddOwnCommentProps {
  oid: string
  renderedComment: string
  hash: string
  comment: string
  name: string
  email: string
  depth: number
  parent: string | null
}

export interface Group {
  date: string
  posts: {
    oid: string
    title: string
    categories: string[]
    comments: number
  }[]
}

export interface HomepagePost {
  title: string
  oid: string
  pub_date: string
  html: string
  comments: number
  categories: string[]
  split: null | number
}
