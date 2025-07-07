import type { NextFunction, Request, Response } from "express"

const rootSong = /^\/song\/[-\w]+\/[-\w]+\/\d+/

export function legacyRedirects(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (rootSong.test(req.path)) {
    return res.redirect(308, `/plog/blogitem-040601-1${req.path}`)
  }

  // E.g. /?page=3&foo=bar should redirect to /p3?foo=bar
  if (req.query.page && (req.path === "/" || req.path.startsWith("/oc-"))) {
    const { page, ...rest } = req.query
    const pageNumber = Number(Array.isArray(page) ? page[0] : page)
    res.set("Cache-Control", "public, max-age=3600")
    if (Number.isNaN(pageNumber) || pageNumber < 1) {
      return res.redirect(302, req.path)
    }
    let newUrl = req.path
    if (pageNumber !== 1) {
      if (!newUrl.endsWith("/")) {
        newUrl += "/"
      }
      newUrl += `p${pageNumber}`
    }
    if (rest) {
      const sp = new URLSearchParams(rest as Record<string, string>)
      if (sp.toString()) {
        newUrl += `?${sp.toString()}`
      }
    }
    return res.redirect(302, newUrl)
  }

  if (req.query.comments === "all") {
    // All these legacy `?comments=all`, redirect those
    return res.redirect(301, req.path)
  }

  // TODO: Consider to redirect all unknown query strings that aren't known.
  if (req.query.magmadomain || req.query.author) {
    // I don't know what these are or where they come from. But they
    // bypass the CDN cache.
    return res.redirect(301, req.path)
  }

  // Maybe turn all sorts of other junk query strings into redirects
  return next()
}
