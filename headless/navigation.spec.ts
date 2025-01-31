import { expect, test } from "@playwright/test"

test("home page", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle("Peterbe.com - Stuff in Peter's head")
})

test("navigate main nav options", async ({ page }) => {
  await page.goto("/")
  await page.locator("#main-nav").getByRole("link", { name: "Archive" }).click()
  await expect(page).toHaveTitle(/Blog archive/)

  await page.locator("#main-nav").getByRole("link", { name: "About" }).click()
  await expect(page).toHaveTitle(/About Peterbe.com/)

  await page.locator("#main-nav").getByRole("link", { name: "Contact" }).click()
  await expect(page).toHaveTitle(/Contact Peter/)

  await page.locator("#main-nav").getByRole("link", { name: "Home" }).click()
  await expect(page).toHaveTitle(/Peterbe\.com/)
})

test("navigation focus and scroll restoration", async ({ page }) => {
  // consider: await page.keyboard.press('End');
  await page.goto("/")
  const aboutLinkAtBottom = page
    .locator("footer")
    .getByRole("link", { name: "About" })
  await aboutLinkAtBottom.scrollIntoViewIfNeeded()

  const scrollPosition = await page.evaluate(() => window.scrollY)
  expect(scrollPosition).toBeGreaterThanOrEqual(3000)

  await aboutLinkAtBottom.click()
  await expect(page).toHaveTitle(/About Peterbe.com/)

  const newScrollPosition = await page.evaluate(() => window.scrollY)
  expect(newScrollPosition).toBe(0)

  await page.goBack()
  await expect(page).toHaveURL("/")

  // this seems to make scroll restoration have a chance to work
  await page.waitForTimeout(100)
  const returnScrollPosition = await page.evaluate(() => window.scrollY)
  expect(returnScrollPosition).toBeGreaterThanOrEqual(3000)
})
