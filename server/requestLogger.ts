import type { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { isbot } from "isbot"
import onFinished from "on-finished"
import postgres from "postgres"
import { getBotAgent } from "./get-bot-agent"

const IS_TEST = import.meta.env?.MODE === "test"

export function requestLogger(databaseUrl?: string) {
  const sql = databaseUrl ? postgres(databaseUrl) : null
  if (!sql && !IS_TEST) {
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
      let botAgent: null | string = null
      if (isbot_ && userAgent) {
        botAgent = getBotAgent(userAgent) || userAgent
      }
      const referer = req.headers.referer || null
      const contentType = res.getHeader("content-type") ?? null
      const contentLength = res.getHeader("content-length") ?? null
      const contentEncoding = res.getHeader("content-encoding") ?? null
      const forwardedHost = req.headers["x-forwarded-host"] ?? null
      const xPullKey = req.headers["x-pull"] ?? null
      const data = {
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          url: req.url,
          userAgent,
          referer,
          forwardedHost,
          host: req.headers.host ?? null,
          xPullKey,
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
          botAgent,
          contentLengthSize: contentLength ? Number(contentLength) : 0,
        },
      }
      if (sql && !IS_TEST) {
        // @ts-expect-error
        await sql`
          insert into base_requestlog
           (url, status_code, created, request, response, meta)
          values (
            ${data.request.url.slice(0, 500)}, ${
              data.response.statusCode
            }, NOW(),
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
