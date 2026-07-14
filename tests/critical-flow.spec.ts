import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Dashboard", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Good morning, Coach!", { exact: true })).toBeVisible();
});

test("coach can search the roster and open a student", async ({ page }) => {
  await page.getByRole("button", { name: "Students", exact: true }).click();
  await expect(page.getByText("My Students", { exact: true })).toBeVisible();
  const search = page.locator("input").first();
  await search.fill("Alex");
  await expect(page.getByText("Alex Rivera", { exact: true }).last()).toBeVisible();
  await page.getByText("Alex Rivera", { exact: true }).last().click();
  await expect(page.getByText("Player Profile", { exact: true }).last()).toBeVisible();
});

test("schedule keeps the lesson creation flow reachable", async ({ page }) => {
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(page.getByText("Jul 13 - Jul 19, 2026", { exact: true })).toBeVisible();
  await page.getByText("New Lesson", { exact: true }).click();
  await expect(page.getByText("Add Session", { exact: true })).toBeVisible();
});

test("dark workspace routes open without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const routes = [
    ["Students", "My Students"],
    ["Schedule", "Schedule"],
    ["Lesson Plans", "Current Plan · 5 Lessons"],
    ["Video Reviews", "Pending (3)"],
    ["Analytics", "Student Improvement"],
  ] as const;

  for (const [button, expected] of routes) {
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(page.getByText(expected, { exact: true }).last()).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test("dashboard attention actions route to the matching workspaces", async ({ page }) => {
  await page.getByRole("button", { name: "Video Reviews", exact: true }).click();
  await expect(page.getByText("Video Reviews", { exact: true }).last()).toBeVisible();

  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page.getByText("3 new booking requests", { exact: true }).click();
  await expect(page.getByText("Schedule", { exact: true }).last()).toBeVisible();
});

test("phone dashboard renders the dark app without the old light dashboard", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto("/");
  await expect(page.getByText("Good morning, Coach!", { exact: true })).toBeVisible();
  await expect(page.getByText("Operations Hub", { exact: true })).toHaveCount(0);
  await page.close();
});
