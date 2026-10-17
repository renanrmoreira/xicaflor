import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export const MP_E2E = {
	api: "http://localhost:3999",
	segredo: "segredo-webhook-e2e",
};

export default defineConfig({
	testDir: "e2e",
	globalSetup: "./e2e/preparar.ts",
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: { baseURL: "http://localhost:3123", trace: "retain-on-failure" },
	projects: [
		{ name: "celular", use: { ...devices["Pixel 7"] } },
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
	],
	webServer: [
		{
			command: "node e2e/mp-falso.ts",
			url: MP_E2E.api,
			reuseExistingServer: !process.env.CI,
		},
		{
			command: process.env.CI ? "pnpm start -p 3123" : "pnpm dev -p 3123",
			url: "http://localhost:3123",
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
			env: {
				MP_API_URL: MP_E2E.api,
				MP_ACCESS_TOKEN: "token-e2e",
				MP_WEBHOOK_SECRET: MP_E2E.segredo,
				SITE_URL: "http://localhost:3123",
			},
		},
	],
});
