import type { NextFunction, Request, Response } from "express"
import { isJunkRequest } from "./is-junk-request"

const BAD_STARTS = [
  "/plog/script-tags-type-in-html5/application_javascript.html/",
  "/plog/script-tags-type-in-html5/no_type.html/",
  "/.env",
]

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

  const badStart = BAD_STARTS.find((start) => req.path.startsWith(start))
  if (badStart) {
    res.set("Cache-Control", "public, max-age=60")
    res.status(404).type("text").send("Bad path start")
    return
  }

  // Add more as you find them. Consider making to just remove from the query
  // string rather than resetting back to the pathname alone.
  const bannedQueryKeys = new Set(["fbclid"])
  for (const k of bannedQueryKeys) {
    if (k in req.query) {
      res.set("Cache-Control", "public, max-age=3600")
      res.redirect(302, req.path)
      return
    }
  }

  // Any request that uses & without a & is junk
  if (req.path.includes("&") && !req.path.includes("?")) {
    res.redirect(302, req.path.split("&")[0])
    return
  }

  try {
    decodeURIComponent(req.path)
  } catch (errr) {
    if (errr instanceof URIError) {
      res.status(400).type("text").send("undecodable path")
      return
    }
  }

  if (
    (req.query.tag && Array.isArray(req.query.tag)) ||
    "tag/index" in req.query ||
    ("c" in req.query && !req.query.c) ||
    ("s" in req.query && "function" in req.query && "vars" in req.query)
  ) {
    warn("bad query keys")
    res.set("Cache-Control", "public, max-age=3600")
    res.redirect(302, req.path)
    return
  }

  next()
}
