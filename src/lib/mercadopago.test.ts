import { expect, it } from "vitest";
import { montarPreferencia } from "./mercadopago";

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
