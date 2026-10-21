import { expect, test } from "@playwright/test";

test("sacola altera quantidade, remove e persiste ao recarregar", async ({
	page,
}) => {
	await page.goto("/p/vestido-loja-e2e");
	await page.getByText("G", { exact: true }).click();
	await page.getByRole("button", { name: "Adicionar à sacola" }).click();
	const sacola = page.getByRole("dialog", { name: "Sua sacola" });
	await expect(
		sacola.getByLabel("Quantidade de Vestido Loja E2E", { exact: true }),
	).toHaveText("1");
	await expect(
		sacola.getByRole("button", {
			name: "Aumentar quantidade de Vestido Loja E2E",
		}),
	).toBeDisabled();
	await sacola.getByRole("button", { name: "Fechar" }).click();
	await expect(
		page.getByRole("button", { name: "Sacola, 1 peça" }),
	).toBeVisible();

	await page.reload();
	await page.getByRole("button", { name: "Sacola, 1 peça" }).click();
	await sacola.getByRole("button", { name: "Remover" }).click();
	await page.getByRole("button", { name: "Desfazer" }).click();
	await expect(
		sacola.getByLabel("Quantidade de Vestido Loja E2E", { exact: true }),
	).toHaveText("1");
	await sacola.getByRole("button", { name: "Remover" }).click();
	await expect(
		sacola.getByText("Sua sacola está vazia por enquanto."),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Sacola vazia" }),
	).toBeAttached();
});

test("ao abrir, a sacola confere estoque e avisa sobre mudanças", async ({
	page,
}) => {
	await page.goto("/p/vestido-loja-e2e");
	const ids = await page.evaluate(async () => {
		const radios = [
			...document.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
		];
		return radios.map((r) => r.value);
	});
	expect(ids).toEqual(["P", "M", "G"]);
	await page.getByText("M", { exact: true }).click();
	await page.getByRole("button", { name: "Adicionar à sacola" }).click();
	const sacola = page.getByRole("dialog", { name: "Sua sacola" });
	await expect(
		sacola.getByLabel("Quantidade de Vestido Loja E2E", { exact: true }),
	).toHaveText("1");

	await page.evaluate(() => {
		const itens = JSON.parse(localStorage.getItem("xf:sacola") ?? "[]");
		itens[0].quantidade = 5;
		itens.push({
			varianteId: "00000000-0000-0000-0000-000000000000",
			quantidade: 1,
		});
		localStorage.setItem("xf:sacola", JSON.stringify(itens));
	});
	await page.reload();
	await page.getByRole("button", { name: /^Sacola, 6 peças$/ }).click();
	await expect(
		sacola.getByText("Vestido Loja E2E: só restam 2 peças."),
	).toBeVisible();
	await expect(
		sacola.getByText("Uma peça não está mais disponível e saiu da sacola."),
	).toBeVisible();
	await expect(
		sacola.getByLabel("Quantidade de Vestido Loja E2E", { exact: true }),
	).toHaveText("2");
	await expect(
		page.getByRole("button", { name: "Sacola, 2 peças" }),
	).toBeAttached();
	await sacola.getByRole("button", { name: "Remover" }).click();
});
