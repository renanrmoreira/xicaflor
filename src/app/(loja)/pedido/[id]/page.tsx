import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { classeBotao } from "@/components/ui/botao";
import { formatarReais } from "@/lib/dinheiro";
import { linkWhatsapp } from "@/lib/loja";
import { linhaDoTempo, rotuloStatus } from "@/lib/pedido";
import { detalheVariante } from "@/lib/sacola";
import { exigirCliente } from "@/server/cliente";
import { linkDePagamento, mercadoPagoAtivo } from "@/server/mercadopago";
import { supabaseServidor } from "@/server/supabase";

export const metadata: Metadata = {
	title: "Seu pedido — Xica Flor",
	robots: { index: false },
};

const RETORNO: Record<string, string> = {
	aprovado: "Pagamento aprovado! Já estamos separando suas peças.",
	pendente: "Pagamento em análise. Avisamos assim que for confirmado.",
	recusado:
		"O pagamento não foi concluído. Você pode tentar de novo enquanto a reserva estiver valendo.",
};

export default async function Page({
	params,
	searchParams,
}: PageProps<"/pedido/[id]">) {
	const { id } = await params;
	const { pagamento } = await searchParams;
	await exigirCliente();
	if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
	const { data: pedido } = await (await supabaseServidor())
		.from("pedidos")
		.select(
			"numero, status, modalidade, frete_a_combinar, subtotal_centavos, frete_centavos, total_centavos, mp_preference_id, reserva_expira_em, itens:itens_pedido(id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade)",
		)
		.eq("id", id)
		.maybeSingle();
	if (!pedido) notFound();

	const aguardando = pedido.status === "aguardando_pagamento";
	const etapas = linhaDoTempo(pedido.status, pedido.modalidade);
	const retorno =
		typeof pagamento === "string" ? RETORNO[pagamento] : undefined;
	const combinar = linkWhatsapp(
		`Olá! Fiz o pedido nº ${pedido.numero} no site e quero combinar o pagamento e a entrega.`,
	);
	const reservadoAte = new Date(pedido.reserva_expira_em).toLocaleTimeString(
		"pt-BR",
		{
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "America/Belem",
		},
	);

	return (
		<section className="flex max-w-2xl flex-col gap-8 px-(--margem) pt-10">
			<div className="flex flex-col gap-2">
				<p className="text-small text-suave">Pedido nº {pedido.numero}</p>
				<h1 className="display text-head">{rotuloStatus(pedido.status)}</h1>
				{retorno && (
					<p role="status" className="bg-amarelo p-3 text-bordo">
						{retorno}
					</p>
				)}
			</div>

			{etapas.length > 0 && (
				<ol aria-label="Andamento do pedido" className="flex flex-col gap-3">
					{etapas.map((e) => (
						<li
							key={e.status}
							aria-current={e.status === pedido.status ? "step" : undefined}
							className={`flex items-center gap-3 ${e.feito ? "" : "text-suave"}`}
						>
							<span
								aria-hidden
								className={`size-3 shrink-0 rounded-full border-2 border-vermelho ${e.feito ? "bg-vermelho" : ""}`}
							/>
							{e.rotulo}
						</li>
					))}
				</ol>
			)}

			{aguardando && (
				<div className="flex flex-col gap-3">
					{pedido.mp_preference_id && mercadoPagoAtivo() ? (
						<a
							href={linkDePagamento(pedido.mp_preference_id)}
							className={classeBotao()}
						>
							Pagar com Mercado Pago
						</a>
					) : (
						<a
							href={combinar}
							target="_blank"
							rel="noopener"
							className={classeBotao()}
						>
							Combinar pagamento pelo WhatsApp
						</a>
					)}
					<p className="text-small text-suave">
						Peças reservadas até {reservadoAte}.
					</p>
				</div>
			)}

			<ul className="flex flex-col divide-y divide-linha border-y border-linha">
				{pedido.itens.map((i) => (
					<li key={i.id} className="flex justify-between gap-4 py-3">
						<span>
							{i.quantidade}× {i.nome_produto}
							<span className="block text-small text-suave">
								{detalheVariante(i, " · ")}
							</span>
						</span>
						<span className="shrink-0">
							{formatarReais(i.preco_unitario_centavos * i.quantidade)}
						</span>
					</li>
				))}
			</ul>
			<dl className="grid grid-cols-[1fr_auto] gap-y-2 [&_dd]:text-right">
				<dt>Produtos</dt>
				<dd>{formatarReais(pedido.subtotal_centavos)}</dd>
				<dt>
					{pedido.modalidade === "retirada" ? "Retirada na loja" : "Entrega"}
				</dt>
				<dd>
					{pedido.frete_a_combinar
						? "a combinar"
						: pedido.frete_centavos
							? formatarReais(pedido.frete_centavos)
							: "grátis"}
				</dd>
				<dt className="border-t border-linha pt-2 font-semibold">Total</dt>
				<dd className="border-t border-linha pt-2 font-semibold">
					{formatarReais(pedido.total_centavos ?? 0)}
				</dd>
			</dl>
			<Link href="/conta" className="text-small underline underline-offset-4">
				Voltar para minha conta
			</Link>
		</section>
	);
}
