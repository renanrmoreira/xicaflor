"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { log } from "@/lib/log";
import { SITE } from "@/lib/loja";
import { montarPreferencia } from "@/lib/mercadopago";
import type { ResultadoCompra } from "@/lib/resultado";
import { exigirCliente } from "./cliente";
import { criarPreferencia, mercadoPagoAtivo } from "./mercadopago";
import { supabaseServidor } from "./supabase";

const entrada = z.object({
	itens: z
		.array(
			z.object({ varianteId: z.uuid(), quantidade: z.int().min(1).max(10) }),
		)
		.min(1)
		.max(50),
	modalidade: z.enum(["entrega", "retirada"]),
});

const ERROS: Record<string, string> = {
	P0001: "Uma peça acabou de esgotar. Confira a sacola e tente de novo.",
	P0002: "Uma peça não está mais disponível. Confira a sacola.",
	"22023": "Complete seu endereço em Minha conta para receber em casa.",
};

export async function finalizarCompra(
	dados: z.input<typeof entrada>,
): Promise<ResultadoCompra> {
	const { perfil } = await exigirCliente();
	const pedido = entrada.safeParse(dados);
	if (!pedido.success)
		return { erro: "Sacola inválida. Atualize a página e tente de novo." };
	const supabase = await supabaseServidor();

	const { data: criado, error } = await supabase
		.rpc("criar_pedido", {
			itens: pedido.data.itens.map((i) => ({
				variante_id: i.varianteId,
				quantidade: i.quantidade,
			})),
			modalidade: pedido.data.modalidade,
			endereco: pedido.data.modalidade === "entrega" ? perfil : undefined,
		})
		.single();
	if (error) {
		if (!ERROS[error.code])
			log("error", "criar pedido", { erro: error.message });
		return {
			erro:
				ERROS[error.code] ?? "Não foi possível criar o pedido. Tente de novo.",
		};
	}
	if (!mercadoPagoAtivo()) return { pedido: criado.id };

	try {
		const { data: completo, error: erroLeitura } = await supabase
			.from("pedidos")
			.select(
				"id, numero, frete_centavos, reserva_expira_em, itens:itens_pedido(variante_id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade)",
			)
			.eq("id", criado.id)
			.single();
		if (erroLeitura) throw erroLeitura;
		const preferencia = await criarPreferencia(
			montarPreferencia(completo, process.env.SITE_URL ?? SITE),
		);
		await supabase.rpc("registrar_preferencia", {
			pedido: criado.id,
			preferencia: preferencia.id,
		});
		return { pagar: preferencia.init_point };
	} catch (erro) {
		Sentry.captureException(erro);
		log("error", "criar preferência do Mercado Pago", {
			erro: String(erro),
			pedido: criado.id,
		});
		return { pedido: criado.id };
	}
}
