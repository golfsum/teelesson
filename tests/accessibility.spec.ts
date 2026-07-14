import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("coach dashboard and primary workspaces have no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results: Array<{ route: string; violations: string[] }> = [];
  for (const route of ["Dashboard", "Students", "Schedule", "Messages", "Payments", "Settings"]) {
    await page.getByRole("button", { name: route, exact: true }).click();
    await page.waitForTimeout(200);
    const scan = await new AxeBuilder({ page }).analyze();
    const violations = scan.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) =>
        `${violation.id}: ${violation.help} (${violation.nodes
          .map((node) => `${node.target.join(" ")} ${node.failureSummary ?? ""}`)
          .join(" | ")})`,
      );
    results.push({ route, violations });
  }
  expect(results.filter((result) => result.violations.length)).toEqual([]);
});
