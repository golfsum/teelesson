import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Dashboard", { exact: true }).first()).toBeVisible();
});

test("coach can search the roster and open a student", async ({ page }) => {
  await page.getByRole("button", { name: "Students", exact: true }).click();
  const search = page.locator("input").first();
  await search.fill("Olivia");
  await expect(page.getByText("Olivia Bennett", { exact: true }).last()).toBeVisible();
  await page.getByText("Olivia Bennett", { exact: true }).last().click();
  await expect(page.getByText("Player Profile", { exact: true }).last()).toBeVisible();
});

test("coach can send a message", async ({ page }) => {
  await page.getByRole("button", { name: "Messages", exact: true }).click();
  const composer = page.getByPlaceholder("Write a message…");
  await composer.fill("Great work today. Send me one face-on swing after practice.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Great work today. Send me one face-on swing after practice.")).toBeVisible();
});

test("demo payment updates without touching Firestore", async ({ page }) => {
  await page.getByRole("button", { name: "Payments", exact: true }).click();
  const count = page.getByText("Outstanding lessons").locator("..").locator("text=/^[0-9]+$/");
  const before = Number(await count.textContent());
  await page.getByRole("button", { name: "Mark paid" }).first().click();
  await expect(count).toHaveText(String(before - 1));
});

test("new lesson form is reachable from the primary action", async ({ page }) => {
  await page.getByRole("button", { name: "Create new lesson", exact: true }).click();
  await expect(page.getByText("Add Session", { exact: true })).toBeVisible();
});

test("dashboard priority actions open the matching workspaces", async ({ page }) => {
  await page.getByRole("button", { name: "Collect: $450 outstanding", exact: true }).click();
  await expect(page.getByText("Outstanding lessons", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page.getByRole("button", { name: "Watch: 2 videos waiting for review", exact: true }).click();
  await expect(page.getByText("Videos", { exact: true }).last()).toBeVisible();
});

test("dashboard timeframe controls update the coaching brief", async ({ page }) => {
  const month = page.getByRole("button", { name: "Show This Month dashboard", exact: true });
  await month.click();
  await expect(page.getByText("Here’s what to keep an eye on across your coaching business this month.", { exact: true })).toBeVisible();

  const today = page.getByRole("button", { name: "Show Today dashboard", exact: true });
  await today.click();
  await expect(page.getByText("You have 5 things that need attention before your first lesson.", { exact: true })).toBeVisible();
});

test("AI Coach recommendation opens the highlighted student", async ({ page }) => {
  await page.getByRole("button", { name: "View Benjamin’s AI recommendation", exact: true }).click();
  await expect(page.getByText("Benjamin King", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Player Profile", { exact: true }).last()).toBeVisible();
});

test("workspace has no browser errors while opening critical routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const name of ["Schedule", "Lessons", "Programs", "Reports", "Videos", "Drills Library", "Settings"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(150);
  }
  expect(errors).toEqual([]);
});

test("phone More menu reaches every secondary workspace", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("/");
  const expected: Record<string, string> = {
    Schedule: "Day",
    Lessons: "Lessons",
    Programs: "Programs",
    Payments: "Payments",
    Reports: "Reports",
    Videos: "Videos",
    "Drills Library": "Drills Library",
    Settings: "Edit Profile",
  };
  for (const name of ["Schedule", "Lessons", "Programs", "Payments", "Reports", "Videos", "Drills Library", "Settings"]) {
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByText(expected[name], { exact: true }).last()).toBeVisible();
  }
  await page.close();
});
