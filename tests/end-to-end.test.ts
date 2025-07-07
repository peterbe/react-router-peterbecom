import type { CheerioAPI } from "cheerio"
import * as cheerio from "cheerio"
import { expect, test } from "vitest"
import { get, isCached, post } from "./test-utils"

function skipToNavWorks(body: string | CheerioAPI) {
  const $ = typeof body === "string" ? cheerio.load(body) : body

  const links = $("ul.skip-to-nav a[href]")
    .map((_i, element) => $(element).attr("href"))
    .get()
  for (const href of links) {
    if (!$(href).length) {
      console.warn(`No element that matches '${href}'`)
      return false
    }
  }

  return true
}

test("home page", async () => {
  const response = await get("/", false, false, { decompress: false })
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-encoding"]).toBe("br")
})

test("meta description", async () => {
  {
    const response = await get("/")
    expect(response.status).toBe(200)
    const $ = cheerio.load(response.data)
    expect($('meta[name="description"]').attr("content")).toBeTruthy()
  }
  {
    const response = await get("/about")
    expect(response.status).toBe(200)
    const $ = cheerio.load(response.data)
    expect($('meta[name="description"]').attr("content")).toBeTruthy()
  }
})

test("home page favicons", async () => {
  const response = await get("/")
  expect(response.status).toBe(200)
  const $ = cheerio.load(response.data)
  const favicon = $('link[rel="icon"]')
  // Based on https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
  expect(favicon.attr("href")).toBe("/favicon.ico")
  expect(favicon.attr("sizes")).toBe("any")
  const touch = $('link[rel="apple-touch-icon"]')
  expect(touch.attr("href")).toBe("/apple-touch-icon.png")
  const favResponse = await get("/favicon.ico")
  expect(favResponse.status).toBe(200)
  expect(favResponse.headers["content-type"]).toBe("image/x-icon")
})

test("manifest", async () => {
  const response = await get("/")
  expect(response.status).toBe(200)
  const $ = cheerio.load(response.data)
  const link = $('link[rel="manifest"]')
  expect(link.length).toBe(1)
  const href = link.attr("href") as string
  expect(href.startsWith("/")).toBe(true)
  expect(href.endsWith(".manifest")).toBe(true)
  const manifestResponse = await get(href)
  expect(manifestResponse.status).toBe(200)
  type Icon = {
    src: string
  }
  const icons: Icon[] = manifestResponse.data.icons
  const responses = await Promise.all(icons.map((icon) => get(icon.src)))
  const statusCodes = responses.map((r) => r.status)
  expect(statusCodes.every((s) => s === 200)).toBe(true)
})

test("home page (page 2)", async () => {
  const response = await get("/p2")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("home page (page 999)", async () => {
  const response = await get("/p999")
  expect(response.status).toBe(404)
})

test("plog archive page", async () => {
  const response = await get("/plog")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe
  const $ = cheerio.load(response.data)
  const dts = $("dt")
    .map((_i, element) => {
      return $(element).text()
    })
    .get()
  expect(dts.includes("June 2004")).toBe(true)
})

test("plog archive page redirect trailing slash", async () => {
  const response = await get("/plog/", false)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog")
})

test("about page", async () => {
  const response = await get("/about")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("contact page", async () => {
  const response = await get("/contact")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("filter home page by category", async () => {
  const response = await get("/oc-JavaScript")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("filter home page by category (page 2)", async () => {
  const response = await get("/oc-JavaScript/p2")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("filter home page by bad category", async () => {
  const response = await get("/oc-Neverheardof")
  expect(response.status).toBe(404)
  // expect(isCached(response)).toBe(true) // TODO: Figure out why headers aren't included when you throw a response
})

test("redirect to correct case of oc categoru", async () => {
  const response = await get("/oc-jAVAsCRIPT")
  expect(response.status).toBe(308)
  expect(response.headers.location).toBe("/oc-JavaScript")
})

test("lyrics post page", async () => {
  const response = await get("/plog/blogitem-040601-1")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("lyrics post page (page 2)", async () => {
  const response = await get("/plog/blogitem-040601-1/p2")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
})

test("lyrics post page (page 999)", async () => {
  const response = await get("/plog/blogitem-040601-1/p999")
  expect(response.status).toBe(404)
})

test("lyrics post page (trailing slash)", async () => {
  const response = await get("/plog/blogitem-040601-1/")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/blogitem-040601-1")
})

test("lyrics post page (/p1)", async () => {
  const response = await get("/plog/blogitem-040601-1/p1")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/blogitem-040601-1")
})

test("certain query strings cause a redirect", async () => {
  for (const querystring of ["comments=all", "magmadomain=something"]) {
    const response = await get(`/anything?${querystring}`)
    expect(response.status).toBe(301)
    expect(response.headers.location).toBe("/anything")
  }
})

test("404'ing should not be cached", async () => {
  const response = await get("/plog/thisdoesnotexist")
  expect(response.status).toBe(404)
  expect(isCached(response)).toBe(false)
})

test("public image (PNG)", async () => {
  const response = await get("/images/about/youshouldwatch.png")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-type"]).toBe("image/png")
})

test("dynamic image (WEBP)", async () => {
  const response = await get("/images/about/youshouldwatch.webp")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-type"]).toBe("image/webp")
})

test("dynamic image not found (PNG)", async () => {
  const response = await get("/images/about/never-heard-of.png")
  expect(response.status).toBe(404)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test("dynamic image not found (WEBP)", async () => {
  const response = await get("/images/about/never-heard-of.webp")
  expect(response.status).toBe(404)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test.each([
  "/",
  "/p2",
  "/oc-Web+development",
  "/about",
  "/contact",
  "/search",
  "/plog",
  "/plog/blogitem-040601-1",
  "/plog/blogitem-20030629-2128",
])("canonical link on home page (%s)", async (url) => {
  const response = await get(url)
  expect(response.status).toBe(200)
  const $ = cheerio.load(response.data)
  const href = $('link[rel="canonical"]').attr("href")
  expect(href).toBe(`https://www.peterbe.com${url}`)
})

test("go to blog post with trailing slash", async () => {
  const response = await get("/plog/blogitem-20030629-2128/")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/blogitem-20030629-2128")
})

test("go to blog post with trailing /p1 (without query string)", async () => {
  const response = await get("/plog/blogitem-20030629-2128/p1")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/blogitem-20030629-2128")
})

test("go to blog post with trailing /p1 (with query string)", async () => {
  const response = await get("/plog/blogitem-20030629-2128/p1?foo=bar")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/blogitem-20030629-2128?foo=bar")
})

test("blog post with excess after the splat", async () => {
  const response = await get("/plog/blogitem-20030629-2128/foo/bar")
  expect(response.status).toBe(404)
})

test("redirect from trailing slash with Unicode (w/o query string)", async () => {
  const response = await get("/plog/تیک/")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe(encodeURI("/plog/تیک"))
})

test("redirect from trailing slash with Unicode (w query string)", async () => {
  const response = await get("/plog/تیک/?foo=bar")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe(encodeURI("/plog/تیک?foo=bar"))
})

test("redirect from trailing /1 with Unicode", async () => {
  const response = await get("/plog/تیک/p1")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe(encodeURI("/plog/تیک"))
})

test("redirect from urls with & without a ?", async () => {
  const response = await get("/&a=b")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/")
})

test("redirect from urls with & before the ?", async () => {
  const response = await get("/&a=b?c=d")
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/")
})

test("search compression", async () => {
  const response = await get("/search?q=stuff", false, false, {
    decompress: false,
  })
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  expect(response.headers["content-encoding"]).toBe("br")
})

test("search skeleton page (with q)", async () => {
  const response = await get("/search?q=stuff")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  const $ = cheerio.load(response.data)
  expect($("title").text()).toBe('Searching for "stuff"')
  expect($("h1").text()).toBe('Searching for "stuff"')
})

test("search skeleton page (without q)", async () => {
  const response = await get("/search")
  expect(response.status).toBe(200)
  expect(isCached(response)).toBe(true)
  const $ = cheerio.load(response.data)
  expect($("title").text()).toBe("Searching on Peterbe.com")
  expect($("h1").text()).toBe("Search")
})

test("POST request to pages should 405", async () => {
  for (const url of [
    "/",
    "/p2",
    "/oc-Web+development",
    "/about",
    "/contact",
    "/search",
    "/plog",
    "/plog/blogitem-040601-1",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await post(url)
    expect(response.status).toBe(405)
  }
})

test("skip-to-nav", async () => {
  for (const url of [
    "/",
    "/about",
    "/contact",
    "/plog",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await get(url)
    expect(response.status).toBe(200)
    expect(skipToNavWorks(response.data)).toBe(true)
  }
})

test("redirect to blog post song page", async () => {
  const url = "/song/foo-bar/h3l_lo/123"
  const response = await get(url)
  expect(response.status).toBe(308)
  expect(response.headers.location).toBe(`/plog/blogitem-040601-1${url}`)
})

test("undecodeable paths", async () => {
  const url = "/plog/%c0%ae%c0%ae%c0%bb%c0%af%c0%8ahealth"
  const response = await get(url)
  expect(response.status).toBe(400)
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8")
})

test("bypassing the CDN", async () => {
  const url = "/plog?foo=bar"
  // Correct x-forwarded-host
  // And NOT bypassing
  {
    const response = await get(url, false, false, {
      headers: {
        "X-pull": "KeyCDN",
        Host: "www-origin.peterbe.com",
        "X-Forwarded-Host": "www-origin.peterbe.com",
      },
    })
    expect(response.status).toBe(200)
    expect(isCached(response)).toBe(true)
  }

  // Correct x-forwarded-host
  // And BYPASSING with incorrect X-Pull key
  {
    const response = await get(url, false, false, {
      headers: {
        Host: "www-origin.peterbe.com",
        "X-Forwarded-Host": null,
      },
    })
    expect(response.status).toBe(302)
    expect(isCached(response)).toBe(true)
  }
})

test("home page with 'page' query parameter", async () => {
  // Page 2
  {
    const response = await get("/?page=2")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/p2")
    expect(isCached(response)).toBe(true)
  }
  // Page 1
  {
    const response = await get("/?page=1")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/")
    expect(isCached(response)).toBe(true)
  }
  // Page 999
  {
    const response = await get("/?page=999&foo=bar")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/p999?foo=bar")
    expect(isCached(response)).toBe(true)
  }
  // Page -123
  {
    const response = await get("/?page=-123")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/")
    expect(isCached(response)).toBe(true)
  }
  // Page xyz
  {
    const response = await get("/?page=xyz")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/")
    expect(isCached(response)).toBe(true)
  }
  // oc page
  {
    const response = await get("/oc-Web+development?page=14")
    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("/oc-Web+development/p14")
    expect(isCached(response)).toBe(true)
  }
})
