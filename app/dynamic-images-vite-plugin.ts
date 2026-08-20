import path from "node:path"

import type { Plugin } from "vite"

const PUBLIC_DIR = path.resolve("public")

export function dynamicImagesPlugin(): Plugin {
  return {
    name: "dynamic-images-plugin",
    apply: "serve",
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url
          if (!url) return next()

          if (url.startsWith("/images/") && url.endsWith(".webp")) {
            const pngPath = path.join(
              PUBLIC_DIR,
              url.slice(1).replace(/\.webp$/, ".png"),
            )
            const buffer = await new Bun.Image(pngPath).webp().toBuffer()
            res.writeHead(200, {
              "cache-control": `public,max-age=${60 * 60 * 24}`,
              "content-type": "image/webp",
            })
            res.end(buffer)
          } else {
            return next()
          }
        })
      }
    },
  }
}
