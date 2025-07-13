import type { NextFunction, Request, Response } from "express"

const JUNK_PATH_BASENAME = new Set([
  "wp-login.php",
  "wp-admin.php",
  "xmlrpc.php",
])

const BAD_STARTS = [
  "/plog/script-tags-type-in-html5/application_javascript.html/",
  "/plog/script-tags-type-in-html5/no_type.html/",
]

const IS_TEST = import.meta.env?.MODE === "test"

const warn = (...args: string[]) =>
  !IS_TEST && console.warn("JUNK-BLOCK:", ...args)

export function junkBlock(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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
    // In KeyCDN, a 400 can't be cached
    warn("too many trailing %5C")
    res.set("Cache-Control", "public, max-age=3600")
    res.redirect(302, betterUrl)
    return
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
      // In KeyCDN, a 400 can't be cached
      res.set("Cache-Control", "public, max-age=3600")
      res.redirect(302, "/")
      return
    }
  }

  const { query } = req
  if (query) {
    // E.g. ?0=%3C%2Fscript%3E%3Cw7cyr5%3E&2=ppt07&api=zekd9&callback=gm5f7&code=qzop0&css=a9aj0&
    // or ?AuthState=w7uq28&DirectTo=r82s5&c=ac8s5&d=qmjb3&domain_url=na2z5&file_url=w3x81&folder=bfpj4&
    const needles = ["0", "2"]
    const fives = Object.values(query).filter((value) => value?.length === 5)
    if (needles.some((needle) => needle in query) || fives.length > 3) {
      if (Object.keys(query).length > 3) {
        warn(">3 query keys")
        res.set("Cache-Control", "public, max-age=3600")
        res.redirect(302, req.path)
        return
      }
    } else if (req.method === "GET" && (query.name || query.email)) {
      const name = `${query.name}`
      const email = `${query.email}`
      if (name.length > 50 || email.length > 50) {
        warn("name or email longer than 50")
        res.set("Cache-Control", "public, max-age=3600")
        res.redirect(302, req.path)
        return
      }
    }
  }

  const q = req.query.q
  if (q) {
    if (Array.isArray(q)) {
      warn("array of 'q'")
      res.status(400).type("text").send("Array of q")
      return
    }
    const query = q as string
    if (query.length > 10) {
      if (countChineseCharacters(query) > 10) {
        res.set("Cache-Control", "public, max-age=60")
        res.status(400).type("text").send("Too many Chinese characters")
        return
      }
      if (query.length > 100) {
        res.status(400).type("text").send("Query too long")
        return
      }
    }
  }

  const last = req.path.split("/").at(-1)
  if (last && JUNK_PATH_BASENAME.has(last)) {
    res.set("Cache-Control", "public, max-age=60")
    res.status(400).type("text").send("Junk path basename")
    return
  }
  const badStart = BAD_STARTS.find((start) => req.path.startsWith(start))
  if (badStart) {
    res.set("Cache-Control", "public, max-age=60")
    // I think it has to be 404 for the CDN to have a chance to cache it
    res.status(404).type("text").send("Bad path start")
    return
  }

  // Add more as you find them. Consider making to just remove from the query
  // string rather than resetting back to the pathname alone.
  const bannedQueryKeys = new Set(["fbclid"])
  for (const k of bannedQueryKeys) {
    if (k in req.query) {
      res.set("Cache-Control", "public, max-age=3600")
      res.redirect(302, req.path)
      return
    }
  }

  // Any request that uses & without a & is junk
  if (req.path.includes("&") && !req.path.includes("?")) {
    res.redirect(302, req.path.split("&")[0])
    return
  }

  try {
    decodeURIComponent(req.path)
  } catch (errr) {
    if (errr instanceof URIError) {
      res.status(400).type("text").send("undecodable path")
      return
    }
  }

  if (
    (req.query.tag && Array.isArray(req.query.tag)) ||
    "tag/index" in req.query ||
    ("c" in req.query && !req.query.c)
  ) {
    warn("bad query keys")
    res.set("Cache-Control", "public, max-age=3600")
    res.redirect(302, req.path)
    return
  }

  next()
}

function countChineseCharacters(str: string) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length
}
