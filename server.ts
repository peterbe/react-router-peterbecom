import url from "node:url"
import shrinkRay from "@nitedani/shrink-ray-current"
import compression from "compression"
import type { Request, Response } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import type { ServerBuild } from "react-router"
import { dynamicImages } from "./server/dynamic-images.ts"
import { ip } from "./server/ip.ts"
import { junkBlock } from "./server/junk-block.ts"
import { legacyRedirects } from "./server/legacy-redirects.ts"

import path from "node:path"
import { createRequestHandler } from "@react-router/express"
import dotenv from "dotenv"
import express from "express"
import asyncHandler from "express-async-handler"
import morgan from "morgan"

dotenv.config()

const BACKEND_BASE_URL = process.env.API_BASE || "http://127.0.0.1:8000"
// const BUILD_DIR = path.resolve("build")
const USE_COMPRESSION = Boolean(
  JSON.parse(process.env.USE_COMPRESSION || "false"),
)

const buildPathArg = process.env.BUILD_PATH || process.argv[2]

if (!buildPathArg) {
  console.error(`
Usage: react-router-serve <server-build-path> - e.g. react-router-serve build/server/index.js`)
  process.exit(1)
}

const buildPath = path.resolve(buildPathArg)

const build: ServerBuild = await import(url.pathToFileURL(buildPath).href)

export const app = express()

if (USE_COMPRESSION) {
  app.use(compression())
}

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
)

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

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1d" }))
app.use(express.static("build/client", { maxAge: "1d" }))

app.use(asyncHandler(dynamicImages))

app.use(shrinkRay())

const backendProxy = createProxyMiddleware({
  target: BACKEND_BASE_URL,
  changeOrigin: true,
  pathRewrite: (path, req) => (req as Request).originalUrl as string,
  // pathRewrite: (path, req) => {
  //   return (req as Request).originalUrl
  // },
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
app.post("*", (req: Request, res: Response) => {
  res.sendStatus(405)
})

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  }),
)
const port = process.env.PORT || 3000

export async function main() {
  return app.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
  })
}
