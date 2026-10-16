import { expect, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN } from "./usuarios";

test("admin cria, renomeia, reordena e desativa subcategoria, e salva o link da vitrine", async ({
	page,
}, info) => {
	const sufixo = `${info.project.name}-${Date.now()}`;
	const nome = `Vestidos ${sufixo}`;
	await entrar(page, ADMIN);
	await page.getByRole("link", { name: "Categorias" }).click();
	await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();

	const moda = page.locator("section", {
		has: page.getByRole("heading", { name: "Moda" }),
	});
	await moda.getByLabel("Nova subcategoria em Moda").fill(nome);
	await moda.getByRole("button", { name: "Adicionar" }).click();
	await expect(moda.getByText(nome)).toBeVisible();
	await expect(moda.getByLabel("Nova subcategoria em Moda")).toHaveValue("");

	await moda.getByLabel("Nova subcategoria em Moda").fill(nome);
	await moda.getByRole("button", { name: "Adicionar" }).click();
	await expect(
		moda.getByText("Já existe uma categoria com esse nome."),
	).toBeVisible();

	const linha = moda.getByRole("listitem").filter({ hasText: nome });
	await linha.getByRole("button", { name: "Editar" }).click();
	await moda.getByLabel(`Novo nome de ${nome}`).fill(`${nome} Longos`);
	await moda.getByRole("button", { name: "Salvar" }).click();
	const renomeada = moda
		.getByRole("listitem")
		.filter({ hasText: `${nome} Longos` });
	await expect(renomeada).toBeVisible();

	await renomeada.getByRole("button", { name: "Desativar" }).click();
	await expect(renomeada.getByRole("button", { name: "Ativar" })).toBeVisible();

	const itens = moda.getByRole("listitem");
	const posicao = async () =>
		(await itens.allTextContents()).findIndex((t) => t.includes(nome));
	const antes = await posicao();
	if (antes > 0) {
		await renomeada.getByRole("button", { name: /^Subir/ }).click();
		await expect.poll(posicao).toBe(antes - 1);
	}

	const beleza = page.locator("section", {
		has: page.getByRole("heading", { name: "Beleza" }),
	});
	await beleza
		.getByLabel("Link da loja de afiliada")
		.fill("http://inseguro.com");
	await beleza.getByRole("button", { name: "Salvar" }).click();
	await expect(
		beleza.getByText("Use um link completo começando com https://"),
	).toBeVisible();
	await beleza
		.getByLabel("Link da loja de afiliada")
		.fill("https://loja.exemplo.com/xicaflor");
	await beleza.getByRole("button", { name: "Salvar" }).click();
	await expect(page.getByText("Link salvo")).toBeVisible();
	await page.reload();
	await expect(beleza.getByLabel("Link da loja de afiliada")).toHaveValue(
		"https://loja.exemplo.com/xicaflor",
	);
});
