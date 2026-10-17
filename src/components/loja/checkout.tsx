"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Botao } from "@/components/ui/botao";
import { Esqueleto } from "@/components/ui/esqueleto";
import { formatarReais } from "@/lib/dinheiro";
import { descreverFrete, type Frete } from "@/lib/frete";
import type { ResultadoCompra } from "@/lib/resultado";
import {
	conciliar,
	detalheVariante,
	type VarianteConferida,
} from "@/lib/sacola";
import type { CalcularFrete } from "./entrega";
import { useSacola } from "./sacola";

type Endereco = {
	cep: string | null;
	logradouro: string | null;
	numero: string | null;
	complemento: string | null;
	bairro: string | null;
	cidade: string | null;
	uf: string | null;
};

type Props = {
	endereco: Endereco;
	conferir: (ids: string[]) => Promise<VarianteConferida[]>;
	calcularFrete: CalcularFrete;
	finalizar: (dados: {
		itens: { varianteId: string; quantidade: number }[];
		modalidade: "entrega" | "retirada";
	}) => Promise<ResultadoCompra>;
};

export function Checkout({
	endereco,
	conferir,
	calcularFrete,
	finalizar,
}: Props) {
	const { itens, limpar } = useSacola();
	const router = useRouter();
	const [conferidas, setConferidas] = useState<VarianteConferida[] | null>(
		null,
	);
	const [modalidade, setModalidade] = useState<"entrega" | "retirada">(
		"entrega",
	);
	const [frete, setFrete] = useState<Frete | null>(null);
	const [erro, setErro] = useState("");
	const [pendente, iniciar] = useTransition();
	const enderecoCompleto = Boolean(
		endereco.cep && endereco.logradouro && endereco.numero && endereco.cidade,
	);
	const chave = itens.map((i) => i.varianteId).join(",");

	// biome-ignore lint/correctness/useExhaustiveDependencies: confere de novo só quando mudam as variantes da sacola
	useEffect(() => {
		if (!chave) return setConferidas([]);
		conferir(chave.split(",")).then(setConferidas, () =>
			setErro("Não deu para conferir a sacola. Recarregue a página."),
		);
	}, [chave]);

	useEffect(() => {
		if (endereco.cep)
			calcularFrete(endereco.cep).then(setFrete, () =>
				setErro("Não deu para calcular o frete. Recarregue a página."),
			);
	}, [endereco.cep, calcularFrete]);

	if (!conferidas)
		return (
			<div aria-busy className="flex max-w-xl flex-col gap-3">
				<Esqueleto className="h-20 w-full" />
				<Esqueleto className="h-20 w-full" />
				<Esqueleto className="h-12 w-full" />
			</div>
		);

	const { linhas, avisos, total: produtos } = conciliar(itens, conferidas);
	if (!linhas.length)
		return (
			<p className="text-suave">
				Sua sacola está vazia.{" "}
				<Link href="/" className="text-tinta underline underline-offset-4">
					Ver peças
				</Link>
			</p>
		);

	const entregaFrete =
		modalidade === "entrega" ? frete : ({ tipo: "retirada" } as const);
	const valorFrete = entregaFrete?.tipo === "entrega" ? entregaFrete.preco : 0;
	const podePagar =
		modalidade === "retirada" || (enderecoCompleto && frete !== null);

	const pagar = () => {
		setErro("");
		iniciar(async () => {
			const resultado = await finalizar({
				itens: linhas.map((l) => ({
					varianteId: l.id,
					quantidade: l.quantidade,
				})),
				modalidade,
			});
			if ("erro" in resultado) return setErro(resultado.erro);
			limpar();
			if ("pagar" in resultado) window.location.href = resultado.pagar;
			else router.push(`/pedido/${resultado.pedido}`);
		});
	};

	return (
		<div className="grid max-w-4xl gap-10 md:grid-cols-[3fr_2fr]">
			<div className="flex flex-col gap-8">
				{avisos.length > 0 && (
					<div
						role="status"
						className="flex flex-col gap-1 bg-amarelo p-3 text-small text-bordo"
					>
						{avisos.map((a) => (
							<p key={a}>{a}</p>
						))}
					</div>
				)}
				<ul className="flex flex-col divide-y divide-linha border-y border-linha">
					{linhas.map((l) => (
						<li key={l.id} className="flex justify-between gap-4 py-3">
							<span>
								{l.quantidade}× {l.nome}
								<span className="block text-small text-suave">
									{detalheVariante(l, " · ")}
								</span>
							</span>
							<span className="shrink-0 font-semibold">
								{formatarReais(l.preco * l.quantidade)}
							</span>
						</li>
					))}
				</ul>

				<fieldset className="flex flex-col gap-3">
					<legend className="mb-2 text-small font-semibold">
						Como você quer receber?
					</legend>
					{(["entrega", "retirada"] as const).map((m) => (
						<label
							key={m}
							className="flex min-h-11 cursor-pointer items-center gap-3"
						>
							<input
								type="radio"
								name="modalidade"
								checked={modalidade === m}
								onChange={() => setModalidade(m)}
								className="size-5 accent-vermelho"
							/>
							{m === "entrega"
								? "Entregar no meu endereço"
								: "Retirar na loja (grátis)"}
						</label>
					))}
					{modalidade === "entrega" &&
						(enderecoCompleto ? (
							<p className="border-l-2 border-linha pl-3 text-small text-suave">
								{endereco.logradouro}, {endereco.numero}
								{endereco.complemento ? ` · ${endereco.complemento}` : ""}
								<br />
								{[endereco.bairro, endereco.cidade, endereco.uf]
									.filter(Boolean)
									.join(" · ")}{" "}
								· CEP {endereco.cep}
								<br />
								<Link
									href="/conta"
									className="text-tinta underline underline-offset-4"
								>
									Alterar endereço
								</Link>
							</p>
						) : (
							<p className="bg-amarelo p-3 text-small text-bordo">
								Complete seu endereço para receber em casa.{" "}
								<Link
									href="/conta"
									className="font-semibold underline underline-offset-4"
								>
									Completar em Minha conta
								</Link>
							</p>
						))}
				</fieldset>
			</div>

			<aside className="flex flex-col gap-3 self-start border border-linha p-5 md:sticky md:top-24">
				<div className="flex justify-between">
					<span>Produtos</span>
					<span>{formatarReais(produtos)}</span>
				</div>
				<div className="flex justify-between gap-4 text-small">
					<span>
						{entregaFrete
							? descreverFrete(entregaFrete)
							: endereco.cep
								? "Frete: calculando…"
								: "Frete: informe o endereço"}
					</span>
				</div>
				{entregaFrete?.tipo === "a_combinar" && (
					<p className="text-small text-suave">
						O frete será combinado pelo WhatsApp depois do pagamento das peças.
					</p>
				)}
				<div className="flex items-baseline justify-between border-t border-linha pt-3">
					<span>Total</span>
					<span className="text-lead font-semibold">
						{formatarReais(produtos + valorFrete)}
					</span>
				</div>
				{erro && (
					<p role="alert" className="text-small text-vermelho">
						{erro}
					</p>
				)}
				<Botao
					onClick={pagar}
					pendente={pendente}
					rotuloPendente="Criando pedido"
					disabled={!podePagar}
				>
					Finalizar pedido
				</Botao>
				<p className="text-small text-suave">
					A peça fica reservada para você por 30 minutos.
				</p>
			</aside>
		</div>
	);
}
