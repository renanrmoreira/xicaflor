import "server-only";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import type { montarPreferencia } from "@/lib/mercadopago";
import { avisarPedidoPago } from "@/server/emails";
import { supabaseServico } from "@/server/supabase";

const API = process.env.MP_API_URL ?? "https://api.mercadopago.com";

export const mercadoPagoAtivo = () => Boolean(process.env.MP_ACCESS_TOKEN);

export function linkDePagamento(preferencia: string) {
	return `https://www.mercadopago.com.br/checkout/v1/redirect?pref-id=${encodeURIComponent(preferencia)}`;
}

export async function criarPreferencia(
	corpo: ReturnType<typeof montarPreferencia>,
) {
	const resposta = await fetch(`${API}/checkout/preferences`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
			"content-type": "application/json",
			"x-idempotency-key": corpo.external_reference,
		},
		body: JSON.stringify(corpo),
	});
	if (!resposta.ok)
		throw new Error(
			`Mercado Pago respondeu ${resposta.status} ao criar preferência`,
		);
	return (await resposta.json()) as { id: string; init_point: string };
}

const Pagamento = z.object({
	status: z.string(),
	external_reference: z.uuid(),
	transaction_amount: z.number(),
});

export async function processarPagamento(id: string) {
	const resposta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
		headers: { authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
	});
	if (!resposta.ok)
		throw new Error(
			`Mercado Pago respondeu ${resposta.status} ao consultar pagamento`,
		);
	const pagamento = Pagamento.safeParse(await resposta.json());
	if (!pagamento.success) {
		Sentry.captureException(pagamento.error);
		return "ignorado";
	}
	if (pagamento.data.status !== "approved") return "ignorado";
	const { data, error } = await supabaseServico().rpc("confirmar_pagamento", {
		pedido: pagamento.data.external_reference,
		pagamento: id,
		valor_centavos: Math.round(pagamento.data.transaction_amount * 100),
	});
	if (error) throw error;
	if (data === "pago")
		await avisarPedidoPago(pagamento.data.external_reference);
	if (data !== "pago" && data !== "repetido")
		Sentry.captureMessage(
			`Pagamento ${id} aprovado com resultado "${data}": conferir e estornar manualmente`,
			"error",
		);
	return data;
}
