import type { NextFunction, Request, Response } from "express"

export function cdnByPassRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const host = req.headers.host ?? null

  // BAD!
  // { forwardedHost: null, xPullKey: null, host: 'www-origin.peterbe.com' }
  // GOOD
  // {forwardedHost: 'www.peterbe.com', xPullKey: 'KeyCDN', host:'www-origin.peterbe.com'}

  if (host === "www-origin.peterbe.com") {
    // When you go straight to the origin, this will be the forwarded host.
    // But it's also this when it's KeyCDN pulling from the origin.
    const forwardedHost = req.headers["x-forwarded-host"] ?? null
    const xPullKey = req.headers["x-pull"] ?? null
    if (xPullKey === null && forwardedHost === null) {
      res.set("Cache-Control", "public, max-age=60") // Increase this later in 2025 when certain all is working well
      res.redirect(302, `https://www.peterbe.com${req.url}`)
      return
    }
  }
  next()
}
