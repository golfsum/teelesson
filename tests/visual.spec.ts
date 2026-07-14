import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const routes = ["Dashboard", "Students", "Schedule", "Lessons", "Messages", "Programs", "Payments", "Reports", "Videos", "Drills Library", "Settings"];
const visualRoot = path.join("artifacts", "visual", "forest-reference", "final");
const devices = [
  { name: "reference-large", width: 1812, height: 893 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-small", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
  { name: "phone-small", width: 360, height: 740 },
];

async function scrollMetrics(page: Page) {
  return page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('[data-visual-scroll-target="true"]').forEach((element) => delete element.dataset.visualScrollTarget);
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return element.scrollHeight > element.clientHeight + 2
          && style.overflowY !== "hidden"
          && style.visibility !== "hidden"
          && style.display !== "none"
          && !element.closest('[aria-hidden="true"]')
          && rect.width > 0 && rect.height > 0
          && rect.right > 0 && rect.left < window.innerWidth
          && rect.bottom > 0 && rect.top < window.innerHeight;
      })
      .sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
    const element = candidates[0];
    if (!element) return { clientHeight: window.innerHeight, scrollHeight: window.innerHeight, max: 0, hasTarget: false };
    element.dataset.visualScrollTarget = "true";
    return { clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, max: element.scrollHeight - element.clientHeight, hasTarget: true };
  });
}

async function openRoute(page: Page, route: string, desktop: boolean) {
  if (desktop) {
    await page.getByRole("button", { name: route, exact: true }).click();
    return;
  }
  if (route === "Dashboard") {
    await page.getByRole("button", { name: "Today", exact: true }).click();
  } else if (route === "Students" || route === "Messages") {
    await page.getByRole("button", { name: route, exact: true }).click();
  } else {
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: route, exact: true }).click();
  }
}

for (const device of devices) {
  test(`capture every workspace at ${device.name}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/");
    const deviceRoot = path.join(visualRoot, device.name);
    fs.rmSync(deviceRoot, { recursive: true, force: true });

    for (const route of routes) {
      await openRoute(page, route, device.width >= 1024);
      await page.waitForTimeout(220);
      const slug = route.toLowerCase().replaceAll(" ", "-");
      const routeRoot = path.join(deviceRoot, slug);
      fs.mkdirSync(routeRoot, { recursive: true });
      const metrics = await scrollMetrics(page);
      const step = Math.max(metrics.clientHeight - 100, 1);
      const positions = [...new Set([0, ...Array.from({ length: Math.ceil(metrics.max / step) }, (_, index) => Math.min((index + 1) * step, metrics.max)), metrics.max])];
      console.log(`[visual] ${device.name}/${route}: ${metrics.clientHeight}/${metrics.scrollHeight}, max ${metrics.max}`);
      for (let index = 0; index < positions.length; index += 1) {
        const position = positions[index];
        if (metrics.hasTarget) {
          const actual = await page.locator('[data-visual-scroll-target="true"]').evaluate((element, top) => {
            element.scrollTop = Number(top);
            return element.scrollTop;
          }, position);
          expect(Math.abs(actual - position)).toBeLessThanOrEqual(1);
        }
        await page.waitForTimeout(60);
        await page.screenshot({ path: path.join(routeRoot, `${String(index).padStart(2, "0")}-${Math.round(position)}.png`) });
      }
    }
    await page.close();
    expect(errors).toEqual([]);
  });
}

test("capture phone navigation and AI Coach states", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto("/");
  const stateRoot = path.join(visualRoot, "phone");
  fs.mkdirSync(stateRoot, { recursive: true });

  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.screenshot({ path: path.join(stateRoot, "more-menu.png") });
  await page.getByRole("button", { name: "More", exact: true }).click();
  const metrics = await scrollMetrics(page);
  if (metrics.hasTarget) {
    await page.locator('[data-visual-scroll-target="true"]').evaluate((element) => {
      element.scrollTop = 0;
    });
  }
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(stateRoot, "ai-coach-expanded.png") });
  await page.getByRole("button", { name: "Collapse AI Coach", exact: true }).click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(stateRoot, "ai-coach-collapsed.png") });

  await page.close();
});
