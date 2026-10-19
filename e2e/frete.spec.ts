import { expect, type Page, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN } from "./usuarios";

async function abrirSacolaComPeca(page: Page) {
	await page.goto("/p/vestido-loja-e2e");
	await page.getByText("M", { exact: true }).click();
	await page.getByRole("button", { name: "Adicionar à sacola" }).click();
	return page.getByRole("dialog", { name: "Sua sacola" });
}

async function calcular(page: Page, cep: string) {
	const sacola = page.getByRole("dialog", { name: "Sua sacola" });
	await sacola.getByLabel("CEP").fill(cep);
	await sacola.getByRole("button", { name: "Calcular" }).click();
}

test("frete na sacola: Belém grátis, Mosqueiro e fora a combinar, CEP inválido", async ({
	page,
}) => {
	const sacola = await abrirSacolaComPeca(page);
	await calcular(page, "66060-000");
	await expect(sacola.getByText("Entrega grátis (Belém)")).toBeVisible();

	await sacola.getByLabel("CEP").fill("66910010");
	await expect(sacola.getByText("Entrega grátis (Belém)")).toHaveCount(0);
	await calcular(page, "66910010");
	await expect(
		sacola.getByText(
			"Frete pelo valor do Moto Uber, combinado no WhatsApp (Mosqueiro)",
		),
	).toBeVisible();

	await calcular(page, "01310-100");
	await expect(
		sacola.getByText("Frete a combinar pelo WhatsApp", {
			exact: true,
		}),
	).toBeVisible();

	await calcular(page, "123");
	await expect(sacola.getByText("Digite um CEP com 8 números.")).toBeVisible();
	await sacola.getByRole("button", { name: "Remover" }).click();
});

test("admin define preço do Outeiro e a sacola passa a cobrar", async ({
	page,
}) => {
	await entrar(page, ADMIN);
	await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
	await page.goto("/admin/frete");
	const outeiro = page
		.getByRole("listitem")
		.filter({ has: page.locator('input[value="Outeiro"]') });
	await outeiro.getByLabel("Frete (R$)").fill("10,00");
	await outeiro.getByRole("button", { name: "Salvar" }).click();
	await expect(page.getByText("Zona salva")).toBeVisible();

	const sacola = await abrirSacolaComPeca(page);
	await calcular(page, "66845-020");
	await expect(
		sacola.getByText(/Entrega \(Outeiro\): R\$\s10,00/),
	).toBeVisible();
	await expect(sacola.getByText(/R\$\s199,90/)).toBeVisible();
	await sacola.getByRole("button", { name: "Remover" }).click();

	await page.goto("/admin/frete");
	await outeiro.getByLabel("Frete (R$)").fill("");
	await outeiro.getByRole("button", { name: "Salvar" }).click();
	await expect(page.getByText("Zona salva")).toBeVisible();
});
