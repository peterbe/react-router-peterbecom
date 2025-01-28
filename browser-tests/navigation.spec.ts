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

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
