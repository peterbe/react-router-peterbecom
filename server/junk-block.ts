import type { NextFunction, Request, Response } from "express"

const JUNK_PATH_BASENAME = new Set([
  "wp-login.php",
  "wp-admin.php",
  "xmlrpc.php",
])

export function junkBlock(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const q = req.query.q
  if (q) {
    if (Array.isArray(q)) {
      res.status(400).type("text").send("Array of q")
      return
    }
    const query = q as string
    if (query.length > 10) {
      if (countChineseCharacters(query) > 10) {
        res.status(400).type("text").send("Too many Chinese characters")
        return
      }
    }
  }

  const last = req.path.split("/").at(-1)
  if (JUNK_PATH_BASENAME.has(last!)) {
    res.status(400).type("text").send("Junk path basename")
    return
  }

  // Any request that uses & without a & is junk
  if (req.path.includes("&") && !req.path.includes("?")) {
    return res.redirect(302, req.path.split("&")[0])
  }

  return next()
}

function countChineseCharacters(str: string) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length
}
