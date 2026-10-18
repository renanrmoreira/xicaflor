import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { assinaturaValida, montarPreferencia } from "./mercadopago";

const pedido = {
	id: "ped-1",
	numero: 42,
	frete_centavos: 1500,
	reserva_expira_em: "2026-10-17T15:30:00.000Z",
	itens: [
		{
			variante_id: "v1",
			nome_produto: "Vestido Ipê",
			cor: "Azul",
			tamanho: "M",
			preco_unitario_centavos: 18990,
			quantidade: 2,
		},
	],
};

it("monta a preferência com referência, expiração, frete e retornos", () => {
	const p = montarPreferencia(pedido, "https://loja.test");
	expect(p.external_reference).toBe("ped-1");
	expect(p.date_of_expiration).toBe("2026-10-17T15:30:00.000Z");
	expect(p.expires).toBe(true);
	expect(p.items).toEqual([
		{
			id: "v1",
			title: "Vestido Ipê · Azul · M",
			quantity: 2,
			unit_price: 189.9,
			currency_id: "BRL",
		},
		{
			id: "frete",
			title: "Frete",
			quantity: 1,
			unit_price: 15,
			currency_id: "BRL",
		},
	]);
	expect(p.notification_url).toBe("https://loja.test/api/webhooks/mercadopago");
	expect(p.back_urls.pending).toBe(
		"https://loja.test/pedido/ped-1?pagamento=pendente",
	);
});

it("não cobra frete quando é grátis ou a combinar", () => {
	expect(
		montarPreferencia({ ...pedido, frete_centavos: 0 }, "https://x").items,
	).toHaveLength(1);
});

describe("assinaturaValida", () => {
	const segredo = "segredo";
	const assinar = (manifesto: string) =>
		createHmac("sha256", segredo).update(manifesto).digest("hex");
	const ts = Date.now();
	const v1 = assinar(`id:abc123;request-id:req-1;ts:${ts};`);

	it("aceita a assinatura do manifesto do Mercado Pago", async () => {
		expect(
			await assinaturaValida(`ts=${ts},v1=${v1}`, "req-1", "ABC123", segredo),
		).toBe(true);
	});

	it("recusa assinatura de outro pagamento, ausente ou malformada", async () => {
		expect(
			await assinaturaValida(`ts=${ts},v1=${v1}`, "req-1", "999", segredo),
		).toBe(false);
		expect(await assinaturaValida(null, "req-1", "abc123", segredo)).toBe(
			false,
		);
		expect(
			await assinaturaValida(`ts=${ts},v1=zz`, "req-1", "abc123", segredo),
		).toBe(false);
		expect(
			await assinaturaValida(`ts=${ts},v1=${v1}`, null, "abc123", segredo),
		).toBe(false);
	});

	it("recusa notificação antiga", async () => {
		const velho = Date.now() - 60 * 60_000;
		const assinada = assinar(`id:abc123;request-id:req-1;ts:${velho};`);
		expect(
			await assinaturaValida(
				`ts=${velho},v1=${assinada}`,
				"req-1",
				"abc123",
				segredo,
			),
		).toBe(false);
	});
});
