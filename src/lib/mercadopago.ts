import { detalheVariante } from "./sacola";

type ItemPedido = {
	variante_id: string;
	nome_produto: string;
	cor: string | null;
	tamanho: string | null;
	preco_unitario_centavos: number;
	quantidade: number;
};

type PedidoParaPagar = {
	id: string;
	numero: number;
	frete_centavos: number;
	reserva_expira_em: string;
	itens: ItemPedido[];
};

const reais = (centavos: number) => centavos / 100;

export function montarPreferencia(pedido: PedidoParaPagar, site: string) {
	const itens = pedido.itens.map((i) => ({
		id: i.variante_id,
		title: [i.nome_produto, detalheVariante(i, " · ")]
			.filter(Boolean)
			.join(" · "),
		quantity: i.quantidade,
		unit_price: reais(i.preco_unitario_centavos),
		currency_id: "BRL",
	}));
	if (pedido.frete_centavos > 0)
		itens.push({
			id: "frete",
			title: "Frete",
			quantity: 1,
			unit_price: reais(pedido.frete_centavos),
			currency_id: "BRL",
		});
	const volta = (status: string) =>
		`${site}/pedido/${pedido.id}?pagamento=${status}`;
	return {
		items: itens,
		external_reference: pedido.id,
		statement_descriptor: "XICA FLOR",
		notification_url: `${site}/api/webhooks/mercadopago`,
		back_urls: {
			success: volta("aprovado"),
			pending: volta("pendente"),
			failure: volta("recusado"),
		},
		auto_return: "approved",
		expires: true,
		date_of_expiration: pedido.reserva_expira_em,
		metadata: { numero: pedido.numero },
	};
}
