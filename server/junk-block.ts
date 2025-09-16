import type { NextFunction, Request, Response } from "express"
import { isJunkRequest } from "./is-junk-request"

const IS_TEST = import.meta.env?.MODE === "test"

const warn = (...args: string[]) =>
  !IS_TEST && console.warn("JUNK-BLOCK:", ...args)

export function junkBlock(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const url = req.url

  const junkVerdict = isJunkRequest(req)
  if (junkVerdict) {
    const { redirect, reason, notFound } = junkVerdict
    if (reason) {
      warn(reason)
    }
    res.set("Cache-Control", "public, max-age=3600")
    if (redirect) {
      res.redirect(302, redirect)
    } else {
      res
        .status(notFound ? 404 : 400)
        .type("text")
        .send(reason || "Junk request")
    }
    return
  }

  if (url === "/.well-known/appspecific/com.chrome.devtools.json") {
    res.status(404).type("text").send("Not currently supported")
    return
  }

  next()
}
