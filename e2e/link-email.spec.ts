import { expect, type Page, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const servico = createClient(
	process.env.SUPABASE_URL ?? "",
	process.env.SUPABASE_SECRET_KEY ?? "",
);
const MAILPIT = "http://127.0.0.1:54324/api/v1";

async function linkDoEmail(email: string) {
	for (let tentativa = 0; tentativa < 20; tentativa++) {
		const busca = await (
			await fetch(
				`${MAILPIT}/search?query=${encodeURIComponent(`to:${email}`)}`,
			)
		).json();
		const id = busca.messages?.[0]?.ID;
		if (id) {
			const mensagem = await (await fetch(`${MAILPIT}/message/${id}`)).json();
			const link = String(mensagem.Text).match(/https?:\/\/\S+verify\S+/)?.[0];
			if (link) return link.replace(/&amp;/g, "&");
		}
		await new Promise((ok) => setTimeout(ok, 500));
	}
	throw new Error(`e-mail para ${email} não chegou`);
}

async function novaCliente(page: Page, projeto: string) {
	const email = `link-${projeto}-${Date.now()}@e2e.local`;
	await servico.auth.admin.createUser({
		email,
		password: "senha-antiga-123",
		email_confirm: true,
	});
	await page.goto("/entrar");
	const semSenha = page.getByRole("region", { name: "Sem senha?" });
	await semSenha.getByLabel("E-mail").fill(email);
	return { email, semSenha };
}

test("entra pelo link enviado ao e-mail", async ({ page }, info) => {
	const { email, semSenha } = await novaCliente(page, info.project.name);
	await semSenha
		.getByRole("button", { name: "Receber link para entrar" })
		.click();
	await expect(semSenha.getByRole("status")).toContainText("enviamos o link");
	await page.goto(await linkDoEmail(email));
	await expect(page).toHaveURL(/\/conta$/);
	await expect(page.getByRole("main").getByText(email).first()).toBeVisible();
});

test("recupera a senha pelo e-mail e entra com a nova", async ({
	page,
}, info) => {
	const { email, semSenha } = await novaCliente(page, info.project.name);
	await semSenha.getByRole("button", { name: "Esqueci minha senha" }).click();
	await expect(semSenha.getByRole("status")).toBeVisible();
	await page.goto(await linkDoEmail(email));
	await expect(page).toHaveURL(/\/conta\/nova-senha$/);
	const campo = page.getByLabel(/Nova senha/);
	await expect(campo).toHaveCount(1);
	await campo.fill("senha-nova-456");
	await page.getByRole("button", { name: "Salvar nova senha" }).click();
	await expect(page).toHaveURL(/\/conta$/);

	const { error } = await createClient(
		process.env.SUPABASE_URL ?? "",
		process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
	).auth.signInWithPassword({ email, password: "senha-nova-456" });
	expect(error).toBeNull();
});

test("link inválido volta para o login com aviso", async ({ page }) => {
	await page.goto("/auth/callback?code=invalido&volta=/conta");
	await expect(page).toHaveURL(/\/entrar\?link=expirado$/);
	await expect(page.getByRole("main").getByRole("alert")).toContainText(
		"expirou",
	);
});
