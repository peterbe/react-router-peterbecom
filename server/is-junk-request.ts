import type { Request } from "express"

type Verdict =
  | {
      redirect?: string
      reason?: string
    }
  | undefined

export function isJunkRequest(req: Request): Verdict {
  if (req.query.comment && "email" in req.query && "name" in req.query) {
    return { reason: "GET posted comment", redirect: req.path }
  }

  const search = req.query.search
  const url = req.url

  if (url.endsWith("%5C") || url.endsWith("%5") || url.endsWith("5C")) {
    let betterUrl = url
    if (betterUrl.endsWith("%5")) {
      betterUrl = betterUrl.slice(0, -"%5".length)
    }
    while (betterUrl.endsWith("%5C")) {
      betterUrl = betterUrl.slice(0, -"%5C".length)
    }
    if (betterUrl.endsWith("5C")) {
      betterUrl = betterUrl.slice(0, -"5C".length)
    }
    while (betterUrl.endsWith("%")) {
      betterUrl = betterUrl.slice(0, -1)
    }
    return {
      redirect: betterUrl,
      reason: "too many trailing %5C",
    }
  }

  const userAgent = req.headers["user-agent"]
  if (userAgent?.includes("GPTBot/1.2")) {
    const searchStr =
      (search &&
        (Array.isArray(search) ? search[0].toString() : search.toString())) ||
      ""
    if (
      searchStr.endsWith("\\") ||
      req.path.endsWith("%5C") ||
      req.path.startsWith("/plog/script-tags-type-in-html5/")
    ) {
      return {
        reason: "GPTBot junk",
        redirect: "/",
      }
    }
  }

  return undefined // NOT junk
}
