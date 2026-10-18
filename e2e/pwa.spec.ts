import { expect, test } from "@playwright/test";

test("loja é instalável: manifest, ícones e apple-touch-icon", async ({
	page,
	request,
}) => {
	await page.goto("/");
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		"href",
		"/manifest.webmanifest",
	);
	const apple = await page
		.locator('link[rel="apple-touch-icon"]')
		.getAttribute("href");
	expect(apple).toBeTruthy();
	expect((await request.get(apple ?? "")).ok()).toBe(true);

	const manifest = await (await request.get("/manifest.webmanifest")).json();
	expect(manifest).toMatchObject({
		short_name: "Xica Flor",
		display: "standalone",
	});
	for (const icone of manifest.icons) {
		const resposta = await request.get(icone.src);
		expect(resposta.ok()).toBe(true);
		expect(resposta.headers()["content-type"]).toBe("image/png");
	}
});
