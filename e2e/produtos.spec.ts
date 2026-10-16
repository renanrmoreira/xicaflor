import { expect, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN } from "./usuarios";

test("admin cria peça com variantes, ajusta estoque, edita e oculta", async ({
	page,
}, info) => {
	const nome = `Vestido Ipê ${info.project.name} ${Date.now()}`;
	await entrar(page, ADMIN);
	await page
		.getByRole("navigation", { name: "Admin" })
		.getByRole("link", { name: "Produtos" })
		.click();
	await page.getByRole("link", { name: "Novo produto" }).click();

	await page.getByLabel("Nome").fill(nome);
	await page.getByLabel("Categoria").selectOption({ label: "Vestidos E2E" });
	await page.getByLabel("Preço (R$)").fill("189,90");
	await page.getByRole("button", { name: "Adicionar P, M e G" }).click();
	await expect(page.getByLabel("Tamanho")).toHaveCount(3);
	await page.getByLabel("Estoque").nth(1).fill("2");

	await page.getByLabel("Preço (R$)").first().fill("0");
	await page.getByRole("button", { name: "Salvar produto" }).click();
	await expect(
		page.getByRole("alert").filter({ hasText: "preço maior que zero" }),
	).toBeVisible();
	await page.getByLabel("Preço (R$)").first().fill("189,90");
	await page.getByRole("button", { name: "Salvar produto" }).click();

	await expect(page).toHaveURL(/\/admin\/produtos$/);
	const item = page.getByRole("listitem").filter({ hasText: nome });
	await expect(item.getByLabel("Estoque de M", { exact: true })).toHaveText(
		"2",
	);
	await item.getByRole("button", { name: "Aumentar estoque de M" }).click();
	await expect(item.getByLabel("Estoque de M", { exact: true })).toHaveText(
		"3",
	);
	await item.getByRole("button", { name: "Diminuir estoque de M" }).click();
	await expect(item.getByLabel("Estoque de M", { exact: true })).toHaveText(
		"2",
	);
	await expect(
		item.getByRole("button", { name: "Diminuir estoque de P" }),
	).toBeDisabled();

	await item.getByRole("link", { name: "Editar" }).click();
	await expect(page.getByLabel("Preço (R$)").first()).toHaveValue("189,90");
	await page.getByRole("button", { name: "Remover variante 3" }).click();
	await page.getByRole("button", { name: "Salvar produto" }).click();
	await expect(page).toHaveURL(/\/admin\/produtos$/);
	await expect(item.getByLabel("Estoque de G", { exact: true })).toHaveCount(0);

	await item.getByRole("button", { name: "Ocultar" }).click();
	await expect(item.getByRole("button", { name: "Mostrar" })).toBeVisible();
});

test("produto de Beleza é vitrine, sem variantes", async ({ page }, info) => {
	const nome = `Batom ${info.project.name} ${Date.now()}`;
	await entrar(page, ADMIN);
	await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
	await page.goto("/admin/produtos/novo");
	await page.getByLabel("Nome").fill(nome);
	await page.getByLabel("Categoria").selectOption({ label: "Maquiagem" });
	await expect(page.getByText("Produto de vitrine")).toBeVisible();
	await expect(page.getByLabel("Preço (R$)")).toHaveCount(0);
	await page.getByLabel("Marca (opcional)").fill("O.Lab");
	await page.getByRole("button", { name: "Salvar produto" }).click();
	await expect(page).toHaveURL(/\/admin\/produtos$/);
	await expect(
		page.getByRole("listitem").filter({ hasText: nome }),
	).toBeVisible();
});
