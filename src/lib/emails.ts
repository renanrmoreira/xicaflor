import { formatarReais } from "./dinheiro";
import { detalheVariante } from "./sacola";

export type PedidoEmail = {
	id: string;
	numero: number;
	modalidade: string;
	frete_a_combinar: boolean;
	frete_centavos: number;
	total_centavos: number;
	endereco: Record<string, string> | null;
	nome_cliente: string;
	telefone_cliente: string | null;
	itens: {
		nome_produto: string;
		cor: string | null;
		tamanho: string | null;
		preco_unitario_centavos: number;
		quantidade: number;
	}[];
};

const escapar = (texto: string) =>
	texto.replace(
		/[&<>"']/g,
		(c) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				c
			] ?? c,
	);

function linhaFrete(pedido: PedidoEmail) {
	if (pedido.modalidade === "retirada") return "Retirada na loja: grátis";
	if (pedido.frete_a_combinar) return "Frete a combinar pelo WhatsApp";
	return `Entrega: ${pedido.frete_centavos ? formatarReais(pedido.frete_centavos) : "grátis"}`;
}

function corpo(
	titulo: string,
	paragrafos: string[],
	pedido: PedidoEmail,
	link: string,
) {
	const itens = pedido.itens
		.map((i) => {
			const detalhe = detalheVariante(i, " · ");
			return `<tr><td style="padding:6px 0">${i.quantidade}× ${escapar(i.nome_produto)}${detalhe ? `<br><span style="color:#6b4a50;font-size:13px">${escapar(detalhe)}</span>` : ""}</td><td style="padding:6px 0;text-align:right">${formatarReais(i.preco_unitario_centavos * i.quantidade)}</td></tr>`;
		})
		.join("");
	return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#2A0C11">
<p style="font-size:28px;font-weight:800;letter-spacing:1px;color:#D81B36;margin:0 0 24px">XICA FLOR</p>
<p style="font-size:20px;font-weight:bold;margin:0 0 12px">${titulo}</p>
${paragrafos.map((p) => `<p style="font-size:16px;line-height:1.5">${p}</p>`).join("")}
<table style="width:100%;border-collapse:collapse;border-top:1px solid #eadfe1;border-bottom:1px solid #eadfe1;margin:20px 0">${itens}</table>
<p style="font-size:15px">${linhaFrete(pedido)}<br><strong>Total: ${formatarReais(pedido.total_centavos)}</strong></p>
<p style="margin:28px 0"><a href="${link}" style="background:#D81B36;color:#fff;padding:14px 24px;text-decoration:none;font-weight:bold;display:inline-block">Ver pedido</a></p>
<p style="font-size:13px;color:#6b4a50">Xica Flor · Seja você o seu próprio padrão de beleza!</p>
</div>`;
}

export function emailsDoPedido(pedido: PedidoEmail, site: string) {
	const entrega =
		pedido.modalidade === "retirada"
			? "Avisamos assim que suas peças estiverem prontas para retirar na loja."
			: "Já estamos separando suas peças e avisamos quando saírem para entrega.";
	const e = pedido.endereco;
	const endereco = e
		? `${escapar(`${e.logradouro ?? ""}, ${e.numero ?? ""}${e.complemento ? ` · ${e.complemento}` : ""} · ${e.bairro ?? ""} · ${e.cidade ?? ""} · CEP ${e.cep ?? ""}`)}`
		: "Retirada na loja";
	return {
		cliente: {
			assunto: `Pedido nº ${pedido.numero} confirmado — Xica Flor`,
			html: corpo(
				`Pagamento aprovado, ${escapar(pedido.nome_cliente.split(" ")[0] || "cliente")}!`,
				[`Recebemos o pagamento do pedido nº ${pedido.numero}.`, entrega],
				pedido,
				`${site}/pedido/${pedido.id}`,
			),
		},
		loja: {
			assunto: `Novo pedido pago: nº ${pedido.numero} (${formatarReais(pedido.total_centavos)})`,
			html: corpo(
				`Novo pedido pago: nº ${pedido.numero}`,
				[
					`Cliente: ${escapar(pedido.nome_cliente || "sem nome")}${pedido.telefone_cliente ? ` · WhatsApp ${escapar(pedido.telefone_cliente)}` : ""}`,
					`Entrega: ${endereco}`,
				],
				pedido,
				`${site}/admin/pedidos/${pedido.id}`,
			),
		},
	};
}
