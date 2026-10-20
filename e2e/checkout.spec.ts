import { createHmac } from "node:crypto";
import {
	type APIRequestContext,
	expect,
	type Page,
	test,
} from "@playwright/test";
import { MP_E2E } from "../playwright.config";
import { entrarCliente } from "./entrar";
import { CLIENTE } from "./usuarios";

function notificar(
	request: APIRequestContext,
	id: string,
	segredo = MP_E2E.segredo,
) {
	const ts = String(Date.now());
	const v1 = createHmac("sha256", segredo)
		.update(`id:${id};request-id:req-${id};ts:${ts};`)
		.digest("hex");
	return request.post(`/api/webhooks/mercadopago?data.id=${id}&type=payment`, {
		headers: {
			"x-signature": `ts=${ts},v1=${v1}`,
			"x-request-id": `req-${id}`,
		},
		data: { type: "payment", data: { id } },
	});
}

async function colocarNaSacola(page: Page) {
	await page.goto("/p/blusa-checkout-e2e");
	await page.getByText("G", { exact: true }).click();
	await page.getByRole("button", { name: "Adicionar à sacola" }).click();
	const sacola = page.getByRole("dialog", { name: "Sua sacola" });
	await sacola.getByRole("link", { name: "Finalizar compra" }).click();
}

test("visitante vai do checkout para o login e volta ao checkout", async ({
	page,
}) => {
	await colocarNaSacola(page);
	await expect(page).toHaveURL(/\/entrar\?volta=\/checkout$/);
	const login = page.locator("section", {
		has: page.getByRole("heading", { name: "Entrar" }),
	});
	await login.getByLabel("E-mail").fill(CLIENTE.email);
	await login.getByLabel("Senha").fill(CLIENTE.senha);
	await login.getByRole("button", { name: "Entrar" }).click();
	await expect(page).toHaveURL(/\/checkout$/);
	await expect(
		page.getByRole("heading", { name: "Finalizar pedido" }),
	).toBeVisible();
	await expect(page.getByText(/1× Blusa Checkout E2E/)).toBeVisible();
	await page.goto("/");
	await page.getByRole("button", { name: /^Sacola/ }).click();
	await page
		.getByRole("dialog", { name: "Sua sacola" })
		.getByRole("button", { name: "Remover" })
		.click();
});

test("checkout cria pedido, reserva a peça e envia a preferência ao Mercado Pago", async ({
	page,
	request,
}) => {
	await entrarCliente(page, CLIENTE);
	await colocarNaSacola(page);
	await expect(
		page.getByText("Avenida Visconde de Souza Franco, 100"),
	).toBeVisible();
	await expect(page.getByText("Entrega grátis (Belém)")).toBeVisible();
	await page.getByRole("button", { name: "Finalizar pedido" }).click();

	await expect(page).toHaveURL(/\/pedido\/[0-9a-f-]{36}\?pagamento=pendente$/);
	await expect(
		page.getByRole("heading", { name: "Aguardando pagamento" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Pagar com Mercado Pago" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Sacola vazia" }),
	).toBeAttached();

	const pedidoId = page.url().match(/pedido\/([0-9a-f-]{36})/)?.[1];
	const preferencia = await (
		await request.get(`${MP_E2E.api}/__preferencia?ref=${pedidoId}`)
	).json();
	expect(preferencia.autorizacao).toBe("Bearer token-e2e");
	expect(preferencia.external_reference).toBe(pedidoId);
	expect(preferencia.date_of_expiration).toBeTruthy();
	expect(preferencia.items[0]).toMatchObject({
		title: "Blusa Checkout E2E · Rosa · G",
		quantity: 1,
		unit_price: 99.9,
	});
	expect(preferencia.notification_url).toBe(
		"http://localhost:3123/api/webhooks/mercadopago",
	);

	const pagamentoId = String(Date.now());
	await request.post(`${MP_E2E.api}/__pagamento`, {
		data: {
			id: pagamentoId,
			status: "approved",
			external_reference: pedidoId,
			transaction_amount: 99.9,
		},
	});
	expect((await notificar(request, pagamentoId, "outro")).status()).toBe(401);
	const aprovado = await notificar(request, pagamentoId);
	expect(await aprovado.json()).toEqual({ resultado: "pago" });
	expect(await (await notificar(request, pagamentoId)).json()).toEqual({
		resultado: "repetido",
	});
	const emails = (
		await (await request.get(`${MP_E2E.api}/__emails`)).json()
	).filter((e: { chave: string }) => e.chave.includes(String(pedidoId)));
	expect(emails.map((e: { to: string[] }) => e.to[0]).sort()).toEqual([
		CLIENTE.email,
		"loja@e2e.local",
	]);
	expect(emails[0].html).toContain("Blusa Checkout E2E");
	await page.reload();
	await expect(page.getByRole("heading", { name: "Pago" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Pagar com Mercado Pago" }),
	).toHaveCount(0);
	await expect(
		page
			.getByRole("list", { name: "Andamento do pedido" })
			.locator("[aria-current=step]"),
	).toHaveText("Pago");

	const numero = await page
		.getByRole("main")
		.getByText(/^Pedido nº \d+$/)
		.textContent();
	await page.goto("/conta");
	await page
		.getByRole("link", { name: new RegExp(`${numero} .*Pago`) })
		.click();
	await expect(page).toHaveURL(new RegExp(`/pedido/${pedidoId}$`));
});

test("se o Mercado Pago falhar, o pedido fica criado e segue pelo WhatsApp", async ({
	page,
	request,
}) => {
	await request.post(`${MP_E2E.api}/__falhar`, { data: { vezes: 1 } });
	await entrarCliente(page, CLIENTE);
	await page.goto("/p/blusa-checkout-e2e");
	await page.getByText("M", { exact: true }).click();
	await page.getByRole("button", { name: "Adicionar à sacola" }).click();
	await page
		.getByRole("dialog", { name: "Sua sacola" })
		.getByRole("link", { name: "Finalizar compra" })
		.click();
	await page.getByLabel("Retirar na loja (grátis)").check();
	await expect(page.getByText("Retirada na loja: grátis")).toBeVisible();
	await page.getByRole("button", { name: "Finalizar pedido" }).click();

	await expect(page).toHaveURL(/\/pedido\/[0-9a-f-]{36}$/);
	const combinar = page.getByRole("link", {
		name: "Combinar pagamento pelo WhatsApp",
	});
	await expect(combinar).toHaveAttribute("href", /wa\.me\/5591988008817/);
	await expect(page.getByText("Retirada na loja")).toBeVisible();
});
