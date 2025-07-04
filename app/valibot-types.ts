import * as v from "valibot"

const RelatedPost = v.object({
  oid: v.string(),
  title: v.string(),
  pub_date: v.string(),
  categories: v.optional(v.array(v.string())),
})

export const Post = v.object({
  oid: v.string(),
  title: v.string(),
  pub_date: v.string(),
  url: v.nullable(v.string()),
  categories: v.array(v.string()),
  summary: v.string(),
  open_graph_image: v.nullable(v.string()),
  archived: v.optional(v.boolean()),
  body: v.string(),
  hide_comments: v.boolean(),
  disallow_comments: v.boolean(),
  previous_post: v.nullable(RelatedPost),
  next_post: v.nullable(RelatedPost),
  related_by_category: v.optional(v.array(RelatedPost)),
  related_by_keyword: v.optional(v.array(RelatedPost)),
})
export type Post = v.InferInput<typeof Post>

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

const CommentSchema: v.GenericSchema<Comment> = v.object({
  id: v.number(),
  oid: v.string(),
  comment: v.string(),
  add_date: v.string(),
  not_approved: v.optional(v.boolean()),
  depth: v.number(),
  name: v.nullable(v.string()),
  replies: v.optional(v.array(v.lazy(() => CommentSchema))),
  hash: v.optional(v.string()),
})

export const Comments = v.object({
  truncated: v.union([v.boolean(), v.number()]),
  count: v.number(),
  next_page: v.nullable(v.number()),
  previous_page: v.nullable(v.number()),
  tree: v.array(CommentSchema),
  // The `comments.total_pages` was introduced late.
  // Once we know the CDN is properly purged this can be assumed to
  // always be present.
  total_pages: v.optional(v.number()),
})
export type Comments = v.InferInput<typeof Comments>

export const ServerData = v.object({
  post: Post,
  comments: Comments,
  page: v.optional(v.number()),
})
export type ServerDataType = v.InferInput<typeof ServerData>

const LyricsImage = v.object({
  name: v.string(),
  thumbnail100: v.optional(v.nullable(v.string())),
  url: v.string(),
})
const LyricsArtist = v.object({
  name: v.string(),
})
const LyricsAlbum = v.object({
  name: v.string(),
  year: v.nullable(v.number()),
})
export const LyricsSearchResult = v.object({
  id: v.number(),
  name: v.string(),
  _url: v.string(),
  year: v.optional(v.number()),
  image: v.nullable(LyricsImage),
  fragments: v.array(v.string()),
  artist: LyricsArtist,
  albums: v.array(LyricsAlbum),
})

export type LyricsSearchResult = v.InferInput<typeof LyricsSearchResult>

export const LyricsSearchMetadata = v.object({
  limit: v.number(),
  desperate: v.boolean(),
  total: v.number(),
  search: v.string(),
})

export type LyricsSearchMetadata = v.InferInput<typeof LyricsSearchMetadata>

export const ServerSearchData = v.object({
  results: v.array(LyricsSearchResult),
  metadata: LyricsSearchMetadata,
})

const LyricsSong = v.object({
  name: v.string(),
  text_html: v.string(),
  year: v.nullable(v.number()),
  artist: LyricsArtist,
  albums: v.array(LyricsAlbum),
  image: v.nullable(LyricsImage),
})
export type LyricsSong = v.InferInput<typeof LyricsSong>
export const ServerSongData = v.object({
  song: LyricsSong,
})

export const Group = v.object({
  date: v.string(),
  posts: v.array(
    v.object({
      oid: v.string(),
      title: v.string(),
      categories: v.array(v.string()),
      comments: v.number(),
    }),
  ),
})
export type Group = v.InferInput<typeof Group>

export const IndexServerData = v.object({
  groups: v.array(Group),
})

export const HomepagePost = v.object({
  title: v.string(),
  oid: v.string(),
  pub_date: v.string(),
  html: v.string(),
  comments: v.number(),
  categories: v.array(v.string()),
  split: v.nullable(v.number()),
})

export type HomepagePost = v.InferInput<typeof HomepagePost>

export const HomepageServerData = v.object({
  posts: v.array(HomepagePost),
  next_page: v.nullable(v.number()),
  previous_page: v.nullable(v.number()),
})

export const SubmitData = v.object({
  oid: v.string(),
  hash: v.string(),
  comment: v.string(),
})

// export const PreviewData = v.object({
//   comment: v.string(),
// })

export const PrepareData = v.object({
  csrfmiddlewaretoken: v.string(),
})
