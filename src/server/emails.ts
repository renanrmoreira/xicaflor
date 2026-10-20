import "server-only";
import * as Sentry from "@sentry/nextjs";
import { emailsDoPedido, type PedidoEmail } from "@/lib/emails";
import { siteAtual } from "@/lib/loja";
import { supabaseServico } from "./supabase";

const API = process.env.RESEND_API_URL ?? "https://api.resend.com";

async function enviar(
	para: string,
	assunto: string,
	html: string,
	chave: string,
) {
	const resposta = await fetch(`${API}/emails`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${process.env.RESEND_API_KEY}`,
			"content-type": "application/json",
			"idempotency-key": chave,
		},
		signal: AbortSignal.timeout(5000),
		body: JSON.stringify({
			from: "Xica Flor <contato@xicaflor.com.br>",
			to: [para],
			subject: assunto,
			html,
		}),
	});
	if (!resposta.ok)
		throw new Error(`Resend respondeu ${resposta.status} ao enviar ${chave}`);
}

export async function avisarPedidoPago(pedidoId: string) {
	if (!process.env.RESEND_API_KEY) return;
	try {
		const supabase = supabaseServico();
		const { data: pedido, error } = await supabase
			.from("pedidos")
			.select(
				"id, numero, cliente_id, modalidade, frete_a_combinar, frete_centavos, total_centavos, endereco, cliente:perfis(nome, telefone), itens:itens_pedido(nome_produto, cor, tamanho, preco_unitario_centavos, quantidade)",
			)
			.eq("id", pedidoId)
			.single();
		if (error) throw error;
		const { data: usuario, error: erroUsuario } =
			await supabase.auth.admin.getUserById(pedido.cliente_id);
		if (erroUsuario) Sentry.captureException(erroUsuario);
		const { cliente, loja } = emailsDoPedido(
			{
				...pedido,
				total_centavos: pedido.total_centavos ?? 0,
				endereco: pedido.endereco as PedidoEmail["endereco"],
				nome_cliente: pedido.cliente?.nome ?? "",
				telefone_cliente: pedido.cliente?.telefone ?? null,
			},
			siteAtual(),
		);
		const envios = [];
		if (usuario.user?.email)
			envios.push(
				enviar(
					usuario.user.email,
					cliente.assunto,
					cliente.html,
					`pedido-${pedidoId}-cliente`,
				),
			);
		if (process.env.EMAIL_LOJA)
			envios.push(
				enviar(
					process.env.EMAIL_LOJA,
					loja.assunto,
					loja.html,
					`pedido-${pedidoId}-loja`,
				),
			);
		for (const r of await Promise.allSettled(envios))
			if (r.status === "rejected") Sentry.captureException(r.reason);
	} catch (erro) {
		Sentry.captureException(erro);
	}
}
