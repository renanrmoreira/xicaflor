import { expect, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN, CLIENTE } from "./usuarios";

test("visitante sem login é levado para a tela de entrar", async ({ page }) => {
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/admin\/entrar$/);
});

test("cliente comum recebe 404 no admin", async ({ page }) => {
	await entrar(page, CLIENTE);
	await page.waitForURL(/\/admin$/);
	await expect(
		page.getByRole("heading", { name: "Página não encontrada" }),
	).toBeVisible();
	await expect(page.getByRole("heading", { name: "Painel" })).toHaveCount(0);
});

test("senha errada mostra erro", async ({ page }) => {
	await entrar(page, { ...ADMIN, senha: "errada" });
	await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
});

test("admin entra no painel e sai", async ({ page }) => {
	await entrar(page, ADMIN);
	await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
	await page.getByRole("button", { name: "Sair" }).click();
	await expect(page).toHaveURL(/\/admin\/entrar$/);
});
