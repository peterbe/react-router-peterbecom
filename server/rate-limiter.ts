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
  "http://ahrefs.com/robot/",
  "http://www.semrush.com/bot.html",
  "https://developer.amazon.com/support/amazonbot",
  "Buddybot/1.0",
  "Mozilla/5.0 (compatible; S-Scanner/1.0)",
  "https://bot.seekport.com",
  "https://ibou.io/iboubot.html",
  "https://babbar.tech/crawler",
  "http://mj12bot.com/",
])

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
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
