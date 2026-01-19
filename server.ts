import path from "node:path"
import url from "node:url"
import { createRequestHandler } from "@react-router/express"
import compression from "compression"
import dotenv from "dotenv"
import type { Request, Response } from "express"
import express from "express"
import asyncHandler from "express-async-handler"
import helmet from "helmet"
import { createProxyMiddleware } from "http-proxy-middleware"
import morgan from "morgan"
import type { ServerBuild } from "react-router"
import Rollbar from "rollbar"
import { cdnByPassRedirect } from "./server/cdn-bypass-redirect.ts"
import { dynamicImages } from "./server/dynamic-images.ts"
import { ip } from "./server/ip.ts"
import { junkBlock } from "./server/junk-block.ts"
import { legacyRedirects } from "./server/legacy-redirects.ts"
import { limiter } from "./server/rate-limiter.ts"
import { requestLogger } from "./server/requestLogger.ts"

dotenv.config({ quiet: true })

const rollbar =
  process.env.ROLLBAR_ACCESS_TOKEN &&
  new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

const BACKEND_BASE_URL = process.env.API_BASE || "http://127.0.0.1:8000"
const DATABASE_URL = process.env.DATABASE_URL

const buildPathArg = process.env.BUILD_PATH || process.argv[2]

if (!buildPathArg) {
  console.error(`
Usage: react-router-serve <server-build-path> - e.g. react-router-serve build/server/index.js`)
  process.exit(1)
}

const buildPath = path.resolve(buildPathArg)

const build: ServerBuild = await import(url.pathToFileURL(buildPath).href)

export const app = express()

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.use(compression())

// Move to belong the express.static(...) uses if you don't want to see
// log lines for static assets.
// app.use(morgan("tiny"));
// app.use(morgan("dev"));
// app.use(morgan("common"));
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ":method :url [:date[iso]] :status :res[content-length] - :response-time ms [:user-agent]"
      : "tiny",
  ),
)
app.use(requestLogger(DATABASE_URL))

app.use(limiter)

app.use(
  // helmet({ referrerPolicy: false }),
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.carbonads.com"],
        connectSrc: ["'self'", "srv.carbonads.net", "songsear.ch"],
        imgSrc: [
          "'self'",
          "srv.carbonads.net",
          "ad.doubleclick.net",
          "data:",
          "songsear.ch",
        ],
      },
    },
  }),
)

app.use(express.static("build/client", { maxAge: "14d" }))
app.use(express.static("public", { maxAge: "3d" }))

app.use(asyncHandler(dynamicImages))

const backendProxy = createProxyMiddleware({
  target: BACKEND_BASE_URL,
  changeOrigin: true,
  pathRewrite: (_path, req) => (req as Request).originalUrl as string,
})
app.use("*/rss.xml", backendProxy)
app.use("/robots.txt", backendProxy)
app.use("/sitemap.xml", backendProxy)
app.use("/avatar.random.png", backendProxy)
app.use("/avatar.png", backendProxy)
app.use("/__huey__", backendProxy)
// If the server is localhost:3000 and the backend is https://www.peterbe.com
// it might be a problem with cookies because that server will have `Secure`
// in the `Set-Cookie` which won't be acceptable on http://localhost:3000
app.use("/api/", backendProxy)
app.use("/cache/", backendProxy)
app.use("*/ping", backendProxy) // Legacy. Delete later in 2024

app.use(cdnByPassRedirect)
app.use(legacyRedirects)
app.use(junkBlock)
app.use("/_ip", ip)
app.post(
  "/events",
  createProxyMiddleware({
    target: BACKEND_BASE_URL,
    changeOrigin: true,
    pathRewrite: () => "/api/v1/events",
  }),
)
app.post("*", (_req: Request, res: Response) => {
  res.sendStatus(405)
})

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  }),
)

if (rollbar) {
  app.use(rollbar.errorHandler())
}

const port = process.env.PORT || 3000

export async function main() {
  return app.listen(port, () => {
    console.log(`Express server listening on http://localhost:${port}`)
  })
}
