import type { Request, Response } from "express"

export function ip(req: Request, res: Response) {
  res.status(200).json({
    ip: req.ip || null,
    "remote-addr": req.connection.remoteAddress || null,
    "x-forwarded-for": req.headers["x-forwarded-for"] || null,
  })
}
