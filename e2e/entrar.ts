import type { Page } from "@playwright/test";

export async function entrar(
	page: Page,
	usuario: { email: string; senha: string },
) {
	await page.goto("/admin/entrar");
	await page.getByLabel("E-mail").fill(usuario.email);
	await page.getByLabel("Senha").fill(usuario.senha);
	await page.getByRole("button", { name: "Entrar" }).click();
}
