import { expect, test } from "vitest"
import { get } from "./test-utils"

test("legacy ?replypath query string (happy path)", async () => {
  const sp = new URLSearchParams({
    replypath: "/c12345",
  })
  const response = await get(`/plog/some-post-title?${sp}`)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/some-post-title#c12345")
})

test("legacy ?replypath query string (and keep others)", async () => {
  const sp = new URLSearchParams({
    replypath: "/c12345",
    foo: "bar",
  })
  const response = await get(`/plog/some-post-title?${sp}`)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/some-post-title?foo=bar#c12345")
})

test("legacy ?replypath query string (multiples)", async () => {
  const sp = new URLSearchParams({
    replypath: "/c12345/c67890",
  })
  const response = await get(`/plog/some-post-title?${sp}`)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/some-post-title#c67890")
})

test("legacy ?replypath query string (invalid)", async () => {
  const sp = new URLSearchParams({
    replypath: "bla",
  })
  const response = await get(`/plog/some-post-title?${sp}`)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/some-post-title")
})

test("legacy ?replypath query string (invalid, keep others)", async () => {
  const sp = new URLSearchParams({
    replypath: "bla",
    foo: "bar",
  })
  const response = await get(`/plog/some-post-title?${sp}`)
  expect(response.status).toBe(302)
  expect(response.headers.location).toBe("/plog/some-post-title?foo=bar")
})
