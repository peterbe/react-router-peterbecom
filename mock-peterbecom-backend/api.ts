import type { NextFunction, Request, Response } from "express"
import express from "express"
import formidable from "formidable"
import { blogitems, type Comment } from "./blogitems.ts"

export const router = express.Router()

router.post("/v1/events", (_req: Request, res: Response) => {
  res.json({ ok: true })
})

router.get("/v1/plog/homepage", (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1)
  const size = Number(req.query.size ?? 10)
  const m = (page - 1) * size
  const n = m + size

  const oc = req.query.oc

  const isArrayOverlap = (a: string[], b: string[]) => {
    for (const item of a) {
      if (b.includes(item)) return true
    }
    return false
  }
  if (oc) {
    const ocs = Array.isArray(oc) ? (oc as string[]) : [oc as string]
    let validMatch = false
    for (const blogitem of blogitems) {
      for (const category of blogitem.categories) {
        for (const oc of ocs) {
          if (oc !== category && oc.toLowerCase() === category.toLowerCase()) {
            res.redirect(301, `/oc-${category}`)
            return
          }
          if (oc === category) {
            validMatch = true
          }
        }
      }
    }
    if (!validMatch) {
      res.status(400).json({ error: `Invalid oc '${oc}'` })
      return
    }
  }

  const filteredBlogitems = blogitems.filter((item) => {
    if (oc) {
      return Array.isArray(oc)
        ? isArrayOverlap(oc as string[], item.categories)
        : item.categories.includes(oc as string)
    }
    return true
  })

  const totalPages = Math.ceil(filteredBlogitems.length / size)
  if (page > totalPages) {
    res.status(404).send("Too far back in time")
    return
  }

  const posts = filteredBlogitems.slice(m, n).map((item) => {
    const {
      oid,
      title,
      html,
      comments,
      pub_date,
      disallow_comments,
      split,
      url,
      categories,
    } = item
    return {
      oid,
      title,
      pub_date,
      categories,
      comments: comments.length,
      html,
      url: url || null,
      disallow_comments: Boolean(disallow_comments),
      split: split || null,
    }
  })
  const previous_page = page > 1 ? page - 1 : null
  const next_page = n < blogitems.length ? page + 1 : null

  res.json({ posts, next_page, previous_page })
})

router.get("/v1/plog/", (_req: Request, res: Response) => {
  const buckets = Object.groupBy(blogitems, (item) => {
    return item.pub_date.split("-").slice(0, 2).join(".")
  })

  const groups = Object.entries(buckets).map(([date, posts]) => {
    return {
      date,
      posts: posts?.map((post) => {
        return { ...post, comments: post.comments.length }
      }),
    }
  })

  res.json({ groups })
})

router.post(
  "/v1/plog/comments/preview",
  (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({})
    form.parse(req, (err, fields) => {
      if (err) {
        next(err)
        return
      }
      const comment = fields.comment ? fields.comment[0] : ""
      res.json({ comment })
    })
  },
)

router.post(
  "/v1/plog/comments/submit",
  (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({})
    form.parse(req, (err, fields) => {
      if (err) {
        next(err)
        return
      }
      const comment = fields.comment ? fields.comment[0] : ""
      const oid = fields.oid ? fields.oid[0] : ""
      const name = fields.name ? fields.name[0] : ""
      const email = fields.email ? fields.email[0] : ""
      let hash = fields.hash ? fields.hash[0] : ""

      const item = blogitems.find((item) => item.oid === oid)

      if (!item) {
        res.status(404).json({ error: "Not found" })
        return
      }

      if (hash) {
        const commentPosted = item.comments.find((c) => c.hash === hash)
        if (!commentPosted) {
          res.status(404).json({ error: "Not found" })
          return
        }
        commentPosted.comment = comment
        commentPosted.name = name
        commentPosted.email = email
      } else {
        hash = `${Math.random()}`
        item.comments.push({
          oid,
          name,
          email,
          comment,
          hash,
          add_date: new Date().toISOString(),
          id: item.comments.length + 1,
        })
      }
      res.json({ oid, hash, comment: comment.replaceAll("\n", "<br>\n") })
    })
  },
)

router.get("/v1/plog/comments/prepare", (_req: Request, res: Response) => {
  res.json({ csrfmiddlewaretoken: `${Math.random()}` })
})

router.get("/v1/plog/:slug", (req: Request, res: Response) => {
  const { slug } = req.params
  const page = Number(req.query.page ?? 1)
  const item = blogitems.find((item) => item.oid === slug)
  if (!item) {
    res.status(404).json({ error: "Not found" })
    return
  }

  type PrevNext = {
    oid: string
    title: string
    pub_date: string
    categories: string[]
  }
  let next_post: PrevNext | null = null
  let previous_post: PrevNext | null = null
  let i = 0
  if (slug !== "blogitem-040601-1") {
    for (const item of blogitems) {
      if (item.oid === "blogitem-040601-1") continue
      if (item.oid === slug) {
        const next = blogitems[i + 1]
        if (next) {
          next_post = {
            oid: next.oid,
            title: next.title,
            pub_date: next.pub_date,
            categories: next.categories,
          }
        }

        break
      }
      previous_post = {
        oid: item.oid,
        title: item.title,
        pub_date: item.pub_date,
        categories: item.categories,
      }
      i++
    }
  }

  const {
    oid,
    title,
    html,
    comments,
    pub_date,
    disallow_comments,
    url,
    categories,
    open_graph_image,
    hide_comments,
    summary,
  } = item
  const post = {
    oid,
    title,
    body: html,
    pub_date,
    open_graph_image: open_graph_image || null,
    url: url || null,
    summary,
    categories,
    disallow_comments: Boolean(disallow_comments),
    hide_comments: Boolean(hide_comments),
    next_post,
    previous_post,
  }

  const tree = generateTree(comments)

  const size = 100
  const m = (page - 1) * size
  const n = m + size
  const slicedTree = tree.slice(m, n)
  const total_pages = Math.max(1, Math.ceil(tree.length / size))
  if (page > total_pages) {
    res.status(404).send("gone too far")
    return
  }
  const previous_page = page > 1 ? page - 1 : null
  const next_page = n < tree.length ? page + 1 : null
  const commentsBlock: CommentsBlock = {
    truncated: 0,
    count: item.comments.length,
    total_pages,
    tree: slicedTree,
    next_page,
    previous_page,
  }

  res.json({ post, comments: commentsBlock })
})

type CommentWithDepth = Comment & {
  depth: number
  replies: CommentWithDepth[]
}

type CommentsBlock = {
  truncated: number
  count: number
  total_pages: number
  tree: CommentWithDepth[]
  next_page: number | null
  previous_page: number | null
}

function generateTree(comments: Comment[], depth = 0): CommentWithDepth[] {
  return comments.map((comment) => {
    const replies = generateTree(comment.comments || [], depth + 1)
    return {
      ...comment,
      depth,
      replies,
    }
  })
}
