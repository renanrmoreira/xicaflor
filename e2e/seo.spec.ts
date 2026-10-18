import { expect, test } from "@playwright/test";

test("robots, sitemap e dados estruturados do produto", async ({
	page,
	request,
}) => {
	const robots = await (await request.get("/robots.txt")).text();
	expect(robots).toContain("Disallow: /admin");
	expect(robots).toContain("sitemap.xml");

	const sitemap = await (await request.get("/sitemap.xml")).text();
	expect(sitemap).toContain("/p/vestido-loja-e2e");
	expect(sitemap).not.toContain("/admin");

	await page.goto("/p/vestido-loja-e2e");
	const jsonLd = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent()) ??
			"{}",
	);
	expect(jsonLd).toMatchObject({
		"@type": "Product",
		name: "Vestido Loja E2E",
		offers: { priceCurrency: "BRL" },
	});
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		"content",
		/Vestido Loja E2E/,
	);
	await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
		"content",
		"pt_BR",
	);
});
