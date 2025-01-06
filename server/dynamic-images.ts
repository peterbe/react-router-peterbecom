import path from "path"
import type { NextFunction, Request, Response } from "express"
import fs from "fs/promises"
import sharp from "sharp"

const PUBLIC_DIR = path.resolve("public")

export async function dynamicImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.url.startsWith("/images/")) return next()
  if (!(req.method === "GET" || req.method === "HEAD")) {
    res.status(405).type("text/plain").send("Method Not Allowed")
    return
  }

  try {
    if (req.path.endsWith(".webp")) {
      const pngPath = path.join(
        PUBLIC_DIR,
        req.url.slice(1).replace(/\.webp$/, ".png"),
      )
      const originalBuffer = await fs.readFile(pngPath)
      const image = sharp(originalBuffer)
      const buffer = await image.webp().toBuffer()
      res.set("cache-control", `public,max-age=${60 * 60 * 24}`)
      res.type("image/webp").send(buffer)
      return
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT")
      throw error
  }

  res.set("cache-control", `public,max-age=${60 * 5}`)
  res.status(404).type("text/plain").send("image not found")
}
