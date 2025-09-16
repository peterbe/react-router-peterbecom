import { expect, test } from "vitest"
import { get, isCached } from "./test-utils"

// dotenv.config()

test("strange Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "大发00体育-%28备用网站%20KL99%fff%29-乐动体育-永盈会体育-亿博体育",
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(400)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test("search query is too long", async () => {
  const sp = new URLSearchParams({
    q: "bla".repeat(50),
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(400)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test.each([
  "/plog/script-tags-type-in-html5/no_type.html/javascript3.js/application_javascript.html/javascript2.js/javascript1.js/txt_javascript.html/javascript3.js/javascript2.js/text_javascript.html/javascript1.js/text_javascript.html/text_javascript.html/no_type.html/no_type.html/txt_javascript.html/text_jvassscrippt.html/javascript4.js/javascript4.js/application_javascript.html/txt_javascript.html",
  "/plog/script-tags-type-in-html5/application_javascript.html/javascript9.js/no_type.html/javascript4.js/javascript3.js/txt_javascript.html/javascript2.js/javascript4.js/text_javascript.html/javascript4.js/text_javascript.html/text_javascript.html/no_type.html/no_type.html/text_jvassscrippt.html/txt_javascript.html/javascript3.js/javascript3.js/javascript2.js/txt_javascript.html/text_jvassscrippt.html",
])("strange splats (%s)", async (pathname) => {
  const response = await get(pathname)
  expect(response.status).toBe(404)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
  expect(isCached(response)).toBe(true)
})

test.each([
  "/plog%5C",
  "/plog%5C%5C%5C%5C%5C",
  "/plog5C",
  "/plog%5C%5C%5C%5C%5",
  "/plog%5C%5C%5C%5C%5C",
])("any url ending with %5C (%s)", async (url) => {
  const response = await get(url)
  expect(response.status).toBe(302)
  expect(isCached(response)).toBe(true)
  expect(response.headers.location).toBe("/plog")
})

test("ok Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "彼得",
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(200)
})

test.each(["/xmlrpc.php", "/blog/wp-login.php", "/about/wp-login.php"])(
  "junk URLs",
  async (url) => {
    const response = await get(url)
    expect(response.status).toBe(404)
    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
  },
)

test.each([
  "/plog?0=xsrf4&2=%22-cwxyn6-%22&api=zekd9&callback=gm5f7&code=qzop0&css=a9aj0&future=i1zd1&id=mm508&index=zwc02&item=tm8q3&lang=csi63&list_type=ie7x9&month=pyib1&name=qh1r1&parentId=osnl2&positions=shs71&root=lup28&s=uw9z3&ssr=amov1&terms=nwju2",
  "/plog?foo=abcde&bar=41245&url=qwerty&action=gerta&URL=a9aj0",
])("too many strange query keys (%s)", async (pathname) => {
  const response = await get(pathname)
  expect([302, 429]).toContain(response.status)
  if (response.status === 302) {
    expect(response.headers.location).toBe("/plog")
  }
})

test("long name and/or email", async () => {
  const sp = new URLSearchParams({
    name: "bla",
    email: "ble".repeat(20),
  })
  const response = await get(`/plog?${sp}`)
  expect(response.status).toBe(302)
  expect(isCached(response)).toBe(true)
  expect(response.headers.location).toBe("/plog")
})

test.each([
  ["/plog?fbclid=IwZXh0bgNhZW0CMTEAblabla", "/plog"],
  ["/plog/blogitem-040601-1?c", "/plog/blogitem-040601-1"],
  ["/?tag=1&tag=2", "/"],
  ["/plog?tag/index=blabl", "/plog"],
])("remove certain query keys (%s - %s)", async (uri, redirectLocation) => {
  const response = await get(uri)
  expect(response.status).toBe(302)
  expect(isCached(response)).toBe(true)
  expect(response.headers.location).toBe(redirectLocation)
})

test.each([
  "//wordpress/wp-includes/wlwmanifest.xml",
  "//web/wp-includes/wlwmanifest.xml",
  "//blog/wp-includes/wlwmanifest.xml",
  "/index.php?s=captcha",
  "/simple.php",
  "/1.php",
  "/wp-config.php",
  "//wp-config.php",
])("reject all wordpress attempts (%s)", async (url) => {
  const response = await get(url)
  expect([404, 429]).toContain(response.status)
  if (response.status === 404) {
    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
  }
})

test("GET posted comments", async () => {
  const response = await get(
    "/plog?comment=I+love+your+blog&name=Yetta&email=yetta",
  )
  expect([302, 429]).toContain(response.status)
  if (response.status === 302) {
    expect(response.headers.location).toBe("/plog")
  }
})

test.each([
  "/?action=../../../../wp-config.php",
  "/?asset=../../../../WINDOWS/system32/config/SAM",
  "/?api=http://",
])("reject all wordpress attempts (%s)", async (url) => {
  const response = await get(url)
  expect([302, 429]).toContain(response.status)
  if (response.status === 302) {
    expect(response.headers.location).toBe("/")
  }
})
