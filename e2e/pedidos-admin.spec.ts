import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { entrar } from "./entrar";
import { ADMIN, CLIENTE } from "./usuarios";

const servico = createClient(
	process.env.SUPABASE_URL ?? "",
	process.env.SUPABASE_SECRET_KEY ?? "",
);

async function pedidoPago() {
	const { data: usuarios } = await servico.auth.admin.listUsers({
		perPage: 1000,
	});
	const cliente = usuarios.users.find((u) => u.email === CLIENTE.email);
	const { data: variante } = await servico
		.from("variantes")
		.select("id")
		.limit(1)
		.single();
	const { data: pedido, error } = await servico
		.from("pedidos")
		.insert({
			cliente_id: cliente?.id ?? "",
			modalidade: "retirada",
			subtotal_centavos: 9990,
			status: "pago",
			pago_em: new Date().toISOString(),
		})
		.select("id, numero")
		.single();
	if (error) throw error;
	await servico.from("itens_pedido").insert({
		pedido_id: pedido.id,
		variante_id: variante?.id ?? "",
		nome_produto: "Peça Admin E2E",
		preco_unitario_centavos: 9990,
		quantidade: 1,
	});
	return pedido;
}

test("admin acompanha o pedido pago até a retirada e chama a cliente no WhatsApp", async ({
	page,
}) => {
	const pedido = await pedidoPago();
	await entrar(page, ADMIN);
	await page
		.getByRole("navigation", { name: "Admin" })
		.getByRole("link", { name: "Pedidos" })
		.click();
	await page
		.getByRole("link", { name: new RegExp(`Pedido nº ${pedido.numero} `) })
		.click();

	await expect(page.getByRole("heading", { name: "Pago" })).toBeVisible();
	await expect(page.getByText("1× Peça Admin E2E")).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Chamar no WhatsApp" }),
	).toHaveAttribute(
		"href",
		new RegExp(String.raw`wa\.me/5591988887777\?text=.*${pedido.numero}`),
	);

	for (const [botao, status] of [
		["Marcar como “Separando as peças”", "Separando as peças"],
		["Marcar como “Pronto para retirar”", "Pronto para retirar"],
		["Marcar como “Retirado”", "Retirado"],
	]) {
		await page.getByRole("button", { name: botao }).click();
		await expect(page.getByRole("heading", { name: status })).toBeVisible();
	}
	await expect(
		page.getByRole("button", { name: "Cancelar pedido" }),
	).toHaveCount(0);

	await page.goto("/admin/pedidos?filtro=concluidos");
	await expect(
		page.getByRole("link", { name: new RegExp(`Pedido nº ${pedido.numero} `) }),
	).toBeVisible();

	await page.goto("/admin");
	await expect(
		page.getByRole("heading", { name: "Pedidos em andamento" }),
	).toBeVisible();
	await expect(page.getByText(/^\d+ pedidos? pagos?$/).first()).toBeVisible();
});
