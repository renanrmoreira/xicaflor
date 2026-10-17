import type { Page } from "@playwright/test";

type Usuario = { email: string; senha: string };

export async function entrar(page: Page, usuario: Usuario) {
	await page.goto("/admin/entrar");
	await page.getByLabel("E-mail").fill(usuario.email);
	await page.getByLabel("Senha").fill(usuario.senha);
	await page.getByRole("button", { name: "Entrar" }).click();
}

export async function entrarCliente(page: Page, usuario: Usuario) {
	await page.goto("/entrar");
	const login = page.locator("section", {
		has: page.getByRole("heading", { name: "Entrar" }),
	});
	await login.getByLabel("E-mail").fill(usuario.email);
	await login.getByLabel("Senha").fill(usuario.senha);
	await login.getByRole("button", { name: "Entrar" }).click();
	await page.waitForURL(/\/conta$/);
}
