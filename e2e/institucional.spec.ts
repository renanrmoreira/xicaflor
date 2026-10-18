import { expect, test } from "@playwright/test";

test("rodapé leva às páginas legais com o direito de arrependimento", async ({
	page,
}) => {
	await page.goto("/");
	const rodape = page.getByRole("contentinfo");
	for (const [link, titulo] of [
		["Privacidade", "Privacidade"],
		["Sobre", "Sobre a Xica Flor"],
		["Contato", "Contato"],
		["Trocas e devoluções", "Trocas e devoluções"],
	]) {
		await rodape.getByRole("link", { name: link, exact: true }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: titulo }),
		).toBeVisible();
	}
	await expect(page.getByText(/7 dias corridos/)).toBeVisible();
});
