import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const [mode, baseURL, outputRoot] = process.argv.slice(2);
if (!mode || !baseURL || !outputRoot || !["public", "player"].includes(mode)) {
  throw new Error("Usage: node scripts/capture-runtime-matrix.mjs <public|player> <baseURL> <outputRoot>");
}

const devices = [
  { name: "desktop", width: 1536, height: 1024 },
  { name: "phone", width: 390, height: 844 },
];

const publicRoutes = [
  { slug: "landing", url: "/" },
  { slug: "login", url: "/login" },
  { slug: "signup", url: "/signup" },
  { slug: "public-coach", url: "/coach/demo-coach" },
  { slug: "features", url: "/info/features" },
  { slug: "for-coaches", url: "/info/for-coaches" },
  { slug: "privacy", url: "/info/privacy" },
  { slug: "terms", url: "/info/terms" },
];

async function scrollTarget(page) {
  return page.evaluate(() => {
    document.querySelectorAll('[data-runtime-capture="true"]').forEach((element) => element.removeAttribute("data-runtime-capture"));
    const candidates = Array.from(document.querySelectorAll("body *"))
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return element.scrollHeight > element.clientHeight + 2
          && style.overflowY !== "hidden"
          && rect.width > 0
          && rect.height > 0
          && rect.right > 0
          && rect.left < window.innerWidth;
      })
      .sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
    const element = candidates[0];
    if (!element) return { hasTarget: false, clientHeight: window.innerHeight, max: 0 };
    element.setAttribute("data-runtime-capture", "true");
    return { hasTarget: true, clientHeight: element.clientHeight, max: element.scrollHeight - element.clientHeight };
  });
}

async function captureState(page, root) {
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(root, { recursive: true });
  const metrics = await scrollTarget(page);
  const step = Math.max(metrics.clientHeight - 100, 1);
  const positions = [...new Set([0, ...Array.from({ length: Math.ceil(metrics.max / step) }, (_, index) => Math.min((index + 1) * step, metrics.max)), metrics.max])];
  for (let index = 0; index < positions.length; index += 1) {
    const position = positions[index];
    if (metrics.hasTarget) {
      await page.locator('[data-runtime-capture="true"]').evaluate((element, top) => { element.scrollTop = Number(top); }, position);
    }
    await page.waitForTimeout(70);
    await page.screenshot({ path: path.join(root, `${String(index).padStart(2, "0")}-${Math.round(position)}.png`) });
  }
}

const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  for (const device of devices) {
    const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => errors.push(`${device.name}: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") errors.push(`${device.name}: ${message.text()}`); });
    if (mode === "public") {
      for (const route of publicRoutes) {
        await page.goto(new URL(route.url, baseURL).toString(), { waitUntil: "networkidle" });
        await captureState(page, path.join(outputRoot, device.name, route.slug));
      }
    } else {
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await captureState(page, path.join(outputRoot, device.name, "home"));
      await page.getByRole("button", { name: /Book a Lesson/i }).first().click();
      await page.waitForTimeout(180);
      await captureState(page, path.join(outputRoot, device.name, "book"));
    }
    await page.close();
  }
} finally {
  await browser.close();
}

if (errors.length) throw new Error(`Runtime errors:\n${errors.join("\n")}`);
