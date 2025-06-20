import type { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { isbot } from "isbot"
import onFinished from "on-finished"
import postgres from "postgres"

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
      let botAgent: null | string = null
      if (isbot_ && userAgent) {
        botAgent = getBotAgent(userAgent)
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
          botAgent,
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

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const urlRegex =
  /https?:\/\/(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\/[^\s)]*)?/g

function getBotAgent(userAgent: string): string | null {
  for (let url of userAgent.match(urlRegex) || []) {
    if (url.startsWith("+")) {
      url = url.slice(1)
    }
    return url
  }
  for (let email of userAgent.match(emailRegex) || []) {
    if (email.startsWith("+")) {
      email = email.slice(1)
    }
    return email
  }
  return null
}
