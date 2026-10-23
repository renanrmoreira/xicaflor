import { expect, test } from "@playwright/test";

test("visitante sem login vai de /conta para /entrar", async ({ page }) => {
	await page.goto("/conta");
	await expect(page).toHaveURL(/\/entrar$/);
});

test("cliente cria conta, completa endereço pelo CEP, sai e entra de novo", async ({
	page,
}, info) => {
	const email = `cliente-${info.project.name}-${Date.now()}@e2e.local`;
	await page.route("https://viacep.com.br/**", (rota) =>
		rota.fulfill({
			json: {
				cep: "66060-000",
				logradouro: "Avenida Visconde de Souza Franco",
				bairro: "Umarizal",
				localidade: "Belém",
				uf: "PA",
			},
		}),
	);

	await page.goto("/");
	await page.getByRole("link", { name: "Minha conta" }).click();
	await expect(page).toHaveURL(/\/entrar$/);
	const cadastro = page.locator("section", {
		has: page.getByRole("heading", { name: "Criar conta" }),
	});
	await cadastro.getByLabel("Nome").fill("Maria Teste");
	await cadastro.getByLabel("E-mail").fill(email);
	await cadastro.getByLabel("Senha (mínimo 8 caracteres)").fill("curta");
	await cadastro.getByRole("button", { name: "Criar conta" }).click();
	await expect(cadastro.getByLabel("Nome")).toHaveValue("Maria Teste");
	await cadastro
		.getByLabel("Senha (mínimo 8 caracteres)")
		.fill("senha-segura-1");
	await cadastro.getByRole("button", { name: "Criar conta" }).click();

	await expect(page).toHaveURL(/\/conta$/);
	await expect(page.getByText(email)).toBeVisible();
	await expect(page.getByLabel("Nome")).toHaveValue("Maria Teste");
	await page.getByLabel("CEP").fill("66060000");
	await page.getByLabel("CEP").blur();
	await expect(page.getByLabel("Rua")).toHaveValue(
		"Avenida Visconde de Souza Franco",
	);
	await expect(page.getByLabel("CEP")).toHaveValue("66060-000");
	await page.getByLabel("Número").fill("123");
	await page.getByRole("button", { name: "Salvar dados" }).click();
	await expect(page.getByText("Dados salvos")).toBeVisible();
	await page.reload();
	await expect(page.getByLabel("Bairro")).toHaveCount(1);
	await expect(page.getByLabel("Bairro")).toHaveValue("Umarizal");
	await expect(page.getByLabel("Número")).toHaveValue("123");

	await page.getByRole("button", { name: "Sair" }).click();
	await expect(page).toHaveURL(/\/entrar$/);
	const login = page.locator("section", {
		has: page.getByRole("heading", { name: "Entrar" }),
	});
	await login.getByLabel("E-mail").fill(email);
	await login.getByLabel("Senha").fill("errada-123");
	await login.getByRole("button", { name: "Entrar" }).click();
	await expect(login.getByText("E-mail ou senha incorretos.")).toBeVisible();
	await expect(login.getByLabel("E-mail")).toHaveValue(email);
	await login.getByLabel("Senha").fill("senha-segura-1");
	await login.getByRole("button", { name: "Entrar" }).click();
	await expect(page).toHaveURL(/\/conta$/);
});
