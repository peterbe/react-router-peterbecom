import type { Request } from "express"
import { rateLimit } from "express-rate-limit"
import { isbot } from "isbot"
import { getBotAgent } from "./get-bot-agent"
import { isJunkRequest } from "./is-junk-request"

// Picking these based on https://admin.peterbe.com/analytics/charts#bot-agent-requests
const RATE_LIMIT_BOT_AGENTS = new Set([
  "https://developers.facebook.com/docs/sharing/webmasters/crawler",
  "http://www.bing.com/bingbot.htm",
  "http://www.semrush.com/bot.html",
])

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  skip: (req: Request) => {
    const userAgent = req.headers["user-agent"] || ""
    if (userAgent) {
      const isbot_ = isbot(userAgent)
      if (isbot_ && userAgent) {
        const botAgent = getBotAgent(userAgent) || userAgent
        if (RATE_LIMIT_BOT_AGENTS.has(botAgent)) {
          return false
        }
      }
    }

    if (isJunkRequest(req)) {
      return false
    }

    // Default is to skip rate limiting entirely
    return true
  },
})
