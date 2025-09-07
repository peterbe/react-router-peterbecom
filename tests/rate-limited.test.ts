import { expect, test } from "vitest"
import { get } from "./test-utils"

test("never rate limited", async () => {
  for (const _ in [...Array(50).keys()]) {
    const response = await get("/plog/blogitem-040601-1")
    expect(response.status).toBe(200)
  }
})

test("eventually rate limited", async () => {
  for (const _ in [...Array(50).keys()]) {
    const response = await get("/plog/blogitem-040601-1", false, false, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      },
    })
    expect([200, 429]).toContain(response.status)
  }
  const response = await get("/plog/blogitem-040601-1", false, false, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    },
  })
  expect(response.status).toBe(429)
})
