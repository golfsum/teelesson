import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:19006",
    channel: "chrome",
    colorScheme: "light",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1536, height: 1024 } } },
  ],
  webServer: {
    command: "npx expo start --web --port 19006",
    url: "http://127.0.0.1:19006",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { CI: "1" },
  },
});
