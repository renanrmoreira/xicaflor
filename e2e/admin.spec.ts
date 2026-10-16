import { expect, type Page, test } from "@playwright/test";
import { ADMIN, CLIENTE } from "./usuarios";

async function entrar(page: Page, usuario: { email: string; senha: string }) {
	await page.goto("/admin/entrar");
	await page.getByLabel("E-mail").fill(usuario.email);
	await page.getByLabel("Senha").fill(usuario.senha);
	await page.getByRole("button", { name: "Entrar" }).click();
}

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
