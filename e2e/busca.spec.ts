import { expect, test } from "@playwright/test";

test("busca pelo topo encontra peça enquanto digita", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Buscar peças" }).click();
	await expect(page).toHaveURL(/\/busca$/);
	const campo = page.getByRole("searchbox", { name: "Buscar peças" });
	await expect(campo).toBeFocused();
	await campo.pressSequentially("vestido loja");
	await expect(page).toHaveURL(/\/busca\?q=vestido%20loja$/);
	await expect(
		page.getByRole("link", { name: /Vestido Loja E2E/ }),
	).toBeVisible();
	await expect(page.getByText(/1 peça para “vestido loja”/)).toBeVisible();
});

test("busca sem resultado sugere categorias e não quebra com curinga", async ({
	page,
}) => {
	await page.goto("/busca?q=%25zzz_");
	await expect(page.getByText("Nada encontrado para “%zzz_”.")).toBeVisible();
	await expect(page.getByRole("link", { name: "Maquiagem" })).toBeVisible();
	await page.getByRole("link", { name: "Maquiagem" }).click();
	await expect(page).toHaveURL(/\/c\/maquiagem$/);
});
