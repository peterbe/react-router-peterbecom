import type { ServerResponse } from "node:http"

export function cacheHeader(
  res: ServerResponse,
  cacheControl: string | number = "public,max-age=43200", // 12h
) {
  let correctCacheControl = cacheControl
  if (process.env.NODE_ENV !== "development" && res.statusCode < 400) {
    if (typeof cacheControl === "number") {
      if (cacheControl > 0) {
        correctCacheControl = `public,max-age=${cacheControl}`
      } else {
        correctCacheControl = "private,max-age=0"
      }
    }
    res.setHeader("Cache-Control", correctCacheControl)
  }
}
