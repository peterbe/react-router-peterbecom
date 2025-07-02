import type { NextFunction, Request, Response } from "express"

export function cdnByPassRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const forwardedHost = req.headers["x-forwarded-host"] ?? null
  if (forwardedHost === "www-origin.peterbe.com") {
    // When you go straight to the origin, this will be the forwarded host.
    // But it's also this when it's KeyCDN pulling from the origin.
    const xPullKey = req.headers["x-pull"] ?? null
    const host = req.headers.host ?? null
    if (!(xPullKey === "KeyCDN" && host === "www.peterbe.com")) {
      res.set("Cache-Control", "public, max-age=60") // Increase this later in 2025 when certain all is working well
      res.redirect(302, req.path)
      return
    }
  }
  next()
}
