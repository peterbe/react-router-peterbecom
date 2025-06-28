import dotenv from "dotenv"
import { expect, test } from "vitest"
import { get, isCached } from "./test-utils"

dotenv.config()

test("strange Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "大发00体育-%28备用网站%20KL99%fff%29-乐动体育-永盈会体育-亿博体育",
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(400)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test("excess trailing slashes (query)", async () => {
  const sp = new URLSearchParams({
    search: "blabla\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\",
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(400)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test("excess trailing slashes (path)", async () => {
  const response = await get(
    "/plog/blogitem-040601-1/q/Since%20yo5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C%5C",
  )
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
  "/plog/script-tags-type-in-html5/no_type.html/javascript3.js",
  "/search?search=bla%5C",
  "/plog/blogitem-040601-1/q/Since%20yo5C%5C",
])("strange queries and bad user agent (%s)", async (pathname) => {
  const response = await get(pathname, false, false, {
    headers: {
      "User-Agent": "Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot",
    },
  })
  expect(response.status).toBe(302)
  expect(isCached(response)).toBe(true)
  expect(response.headers.location).toBe("/")
})

test("ok Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "彼得",
  })
  const response = await get(`/search?${sp}`)
  expect(response.status).toBe(200)
})

test("junk URLs", async () => {
  for (const url of [
    "/xmlrpc.php",
    "/blog/wp-login.php",
    "/about/wp-login.php",
  ]) {
    const response = await get(url)
    expect(response.status).toBe(400)
    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
  }
})

test.each([
  "/plog?0=xsrf4&2=%22-cwxyn6-%22&api=zekd9&callback=gm5f7&code=qzop0&css=a9aj0&future=i1zd1&id=mm508&index=zwc02&item=tm8q3&lang=csi63&list_type=ie7x9&month=pyib1&name=qh1r1&parentId=osnl2&positions=shs71&root=lup28&s=uw9z3&ssr=amov1&terms=nwju2",
])("too many strange query keys (%s)", async (pathname) => {
  const response = await get(pathname)
  expect(response.status).toBe(302)
  expect(isCached(response)).toBe(true)
  expect(response.headers.location).toBe("/plog")
})
