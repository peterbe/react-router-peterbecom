import asyncHandler from "express-async-handler"
import { isbot } from "isbot"
import onFinished from "on-finished"
import postgres from "postgres"

import type { NextFunction, Request, Response } from "express"

export function requestLogger(databaseUrl?: string) {
  const sql = databaseUrl ? postgres(databaseUrl) : null
  if (!sql) {
    console.warn(
      "No valid DATABASE_URL set so not logging requests to Postgres",
    )
  }
  return asyncHandler(function logger(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const _startAt = process.hrtime()

    async function logRequest() {
      // time elapsed from request start
      const elapsed = process.hrtime(_startAt)

      const ms = elapsed[0] * 1e3 + elapsed[1] * 1e-6
      const userAgent = req.headers["user-agent"] || ""

      const isbot_ = isbot(userAgent)
      let botUrl: null | string = null
      if (isbot_ && userAgent) {
        const match = userAgent.match(/\+(http.*)\)/)
        if (match) {
          botUrl = match[1]
        }
      }
      const referer = req.headers.referer || null
      const contentType = res.getHeader("content-type") ?? null
      const contentLength = res.getHeader("content-length") ?? null
      const contentEncoding = res.getHeader("content-encoding") ?? null
      const data = {
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          url: req.url,
          userAgent,
          referer,
          forwardedHost: req.headers["x-forwarded-host"] ?? null,
          host: req.headers.host ?? null,
        },
        response: {
          statusCode: res.statusCode,
          contentType,
          contentLength,
          contentEncoding,
        },
        meta: {
          elapsedMs: ms,
          isbot: isbot_,
          botUrl,
          contentLengthSize: contentLength ? Number(contentLength) : 0,
        },
      }
      if (sql) {
        // @ts-ignore
        await sql`
          insert into base_requestlog
           (url, status_code, created, request, response, meta)
          values (
            ${data.request.url.slice(0, 500)}, ${data.response.statusCode}, NOW(),
            ${data.request}, 
            ${data.response}, 
            ${data.meta}
          )
        `
      }
    }

    function logRequestTried() {
      try {
        return logRequest()
      } catch (error) {
        console.error("Failure to log request:", error)
      }
    }

    onFinished(res, logRequestTried)

    next()
  })
}
