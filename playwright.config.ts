import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
	testDir: "e2e",
	globalSetup: "./e2e/preparar.ts",
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: { baseURL: "http://localhost:3123", trace: "retain-on-failure" },
	projects: [
		{ name: "celular", use: { ...devices["Pixel 7"] } },
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
	],
	webServer: {
		command: process.env.CI ? "pnpm start -p 3123" : "pnpm dev -p 3123",
		url: "http://localhost:3123",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
