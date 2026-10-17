import "server-only";
import type { montarPreferencia } from "@/lib/mercadopago";

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
