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

export function junkBlock(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.path.endsWith("%5C%5C%5C%5C%5C%5C%5C")) {
    res.set("Cache-Control", "public, max-age=60")
    res.status(400).type("text").send("Bad path end")
    return
  }

  const search = req.query.search
  const searchStr =
    (search &&
      (Array.isArray(search) ? search[0].toString() : search.toString())) ||
    ""
  if (searchStr.endsWith("\\\\\\\\")) {
    res.set("Cache-Control", "public, max-age=60")
    res.status(400).type("text").send("Bad search query")
    return
  }
  const userAgent = req.headers["user-agent"]
  if (userAgent?.includes("GPTBot/1.2")) {
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

  const q = req.query.q
  if (q) {
    if (Array.isArray(q)) {
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

  next()
}

function countChineseCharacters(str: string) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length
}
