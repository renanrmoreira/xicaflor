import { expect, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN } from "./usuarios";

test("home mostra o nome monumento, destaques e novidades", async ({
	page,
}) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { level: 1, name: "Xica Flor" }),
	).toBeVisible();
	await expect(page.getByRole("heading", { name: "Destaques" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Novidades" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: /Vestido Loja E2E/ }).first(),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Ver vitrine de beleza" }),
	).toBeVisible();
});

test("categoria lista as peças e filtra por subcategoria", async ({ page }) => {
	await page.goto("/c/moda");
	await expect(
		page.getByRole("heading", { level: 1, name: "Moda" }),
	).toBeVisible();
	await page.getByRole("link", { name: "Vestidos E2E" }).last().click();
	await expect(page).toHaveURL(/\/c\/vestidos-e2e$/);
	await expect(
		page.getByRole("link", { name: /Vestido Loja E2E/ }),
	).toBeVisible();
});

test("produto ordena tamanhos, bloqueia esgotado e monta o pedido pelo WhatsApp", async ({
	page,
}) => {
	await page.goto("/p/vestido-loja-e2e");
	await expect(
		page.getByRole("heading", { level: 1, name: "Vestido Loja E2E" }),
	).toBeVisible();
	await expect(page.getByText("R$ 189,90")).toBeVisible();

	const tamanhos = page
		.getByRole("radiogroup", { name: "Tamanho" })
		.getByRole("radio");
	await expect(
		page.getByRole("group", { name: /Tamanho/ }).getByRole("radio"),
	).toHaveCount(3);
	const rotulos = await page
		.getByRole("group", { name: /Tamanho/ })
		.getByRole("radio")
		.evaluateAll((r) => r.map((x) => (x as HTMLInputElement).value));
	expect(rotulos).toEqual(["P", "M", "G"]);
	expect(await tamanhos.count()).toBe(0);

	await expect(page.getByRole("radio", { name: "P" })).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Escolha o tamanho" }),
	).toBeDisabled();

	await page.getByText("M", { exact: true }).click();
	await expect(page.getByText("Últimas 2 peças")).toBeVisible();
	const pedido = page.getByRole("link", { name: "Comprar pelo WhatsApp" });
	await expect(pedido).toHaveAttribute("href", /wa\.me\/5591988008817/);
	const texto = decodeURIComponent((await pedido.getAttribute("href")) ?? "");
	expect(texto).toContain("Vestido Loja E2E (Azul, M)");
	expect(texto).toContain("/p/vestido-loja-e2e");
});

test("produto de vitrine não tem preço e leva para a loja parceira", async ({
	page,
}) => {
	await page.goto("/p/batom-loja-e2e");
	await expect(
		page.getByRole("heading", { level: 1, name: "Batom Loja E2E" }),
	).toBeVisible();
	await expect(page.getByText(/R\$/)).toHaveCount(0);
	await expect(page.getByRole("radio")).toHaveCount(0);
	const link = page.getByRole("link", { name: "Comprar na loja" });
	await expect(link).toHaveAttribute(
		"href",
		"https://loja.exemplo.com/xicaflor",
	);
	await expect(link).toHaveAttribute("target", "_blank");
	await expect(link).toHaveAttribute("rel", "sponsored noopener");
});

test("produto inexistente mostra página não encontrada sem indexação", async ({
	page,
}) => {
	await page.goto("/p/nao-existe");
	await expect(
		page.locator('meta[name="robots"][content*="noindex"]').first(),
	).toBeAttached();
	await expect(
		page.getByRole("heading", { name: "Página não encontrada" }),
	).toBeVisible();
});

test("mudança de estoque no admin aparece na loja na hora", async ({
	page,
}) => {
	await page.goto("/p/vestido-loja-e2e");
	await expect(page.getByRole("radio", { name: "P" })).toBeDisabled();

	await entrar(page, ADMIN);
	await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
	await page.goto("/admin/produtos");
	const item = page
		.getByRole("listitem")
		.filter({ hasText: "Vestido Loja E2E" })
		.first();
	await item
		.getByRole("button", { name: "Aumentar estoque de Azul · P" })
		.click();
	await expect(
		item.getByLabel("Estoque de Azul · P", { exact: true }),
	).toHaveText("1");

	await page.goto("/p/vestido-loja-e2e");
	await expect(page.getByRole("radio", { name: "P" })).toBeEnabled();

	await page.goto("/admin/produtos");
	await item
		.getByRole("button", { name: "Diminuir estoque de Azul · P" })
		.click();
	await expect(
		item.getByLabel("Estoque de Azul · P", { exact: true }),
	).toHaveText("0");
});
