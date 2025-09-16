import type { Request } from "express"

type Verdict =
  | {
      redirect?: string
      reason?: string
      notFound?: boolean
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

  const { query } = req
  if (query) {
    // E.g. ?0=%3C%2Fscript%3E%3Cw7cyr5%3E&2=ppt07&api=zekd9&callback=gm5f7&code=qzop0&css=a9aj0&
    // or ?AuthState=w7uq28&DirectTo=r82s5&c=ac8s5&d=qmjb3&domain_url=na2z5&file_url=w3x81&folder=bfpj4&
    const needles = ["0", "2", "s"]
    const fives = Object.values(query).filter((value) => value?.length === 5)
    if (needles.some((needle) => needle in query) || fives.length > 3) {
      if (Object.keys(query).length > 3) {
        return {
          reason: ">3 query keys",
          redirect: req.path,
        }
      }
    } else if (req.method === "GET" && (query.name || query.email)) {
      const name = `${query.name}`
      const email = `${query.email}`
      if (name.length > 50 || email.length > 50) {
        return {
          reason: "name or email longer than 50",
          redirect: req.path,
        }
      }
    }

    if (
      // For example, /?action=../../../../wp-config.php", or "/?api=http://",
      ["action", "asset", "api"].some(
        (needle) =>
          query[needle] &&
          (String(query[needle]).match(/\//g) || []).length >= 2,
      )
    ) {
      return {
        reason: "bad query keys",
        redirect: req.path,
      }
    }
  }

  const q = req.query.q
  if (q) {
    if (Array.isArray(q)) {
      return {
        reason: "array of 'q'",
      }
    }
    const query = q as string
    if (query.length > 10) {
      if (countChineseCharacters(query) > 10) {
        return {
          reason: "Too many Chinese characters",
        }
      }
      if (query.length > 100) {
        return {
          reason: "Query too long",
        }
      }
    }
  }

  const pathSplit = req.path.split("/")
  if (
    req.path.endsWith(".php") ||
    ["wlwmanifest.xml", "wp-includes"].find((segment) =>
      pathSplit.includes(segment),
    )
  ) {
    return {
      reason: "looks like WordPress",
      notFound: true,
    }
  }

  return undefined // NOT junk
}

function countChineseCharacters(str: string) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length
}
