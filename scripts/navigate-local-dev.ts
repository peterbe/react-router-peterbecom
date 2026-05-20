import { expect } from "vitest"

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

main()
async function main() {
  await using view = new Bun.WebView()

  await view.navigate(BASE_URL)
  let title = await view.evaluate("document.title")
  expect(title).toBe("Peterbe.com - Stuff in Peter's head")

  // XXX why doesn't this work?!
  // await view.click('a[href="/plog"]', {
  //   timeout: 2000,
  // })
  // await sleep(500)
  // title = await view.evaluate("document.title")
  // console.log({ title })

  const makeUrl = (path: string) => `${BASE_URL}${path}`

  await view.navigate(makeUrl("/plog"))
  title = await view.evaluate("document.title")
  expect(title).toMatch(/Blog archive/)

  await view.navigate(makeUrl("/about"))
  title = await view.evaluate("document.title")
  expect(title).toMatch(/About/)

  await view.navigate(makeUrl("/contact"))
  title = await view.evaluate("document.title")
  expect(title).toMatch(/Contact/)
}
