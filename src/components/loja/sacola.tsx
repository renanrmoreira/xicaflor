"use client";

import Link from "next/link";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
	useTransition,
} from "react";
import { Esqueleto } from "@/components/ui/esqueleto";
import { Gaveta } from "@/components/ui/gaveta";
import { formatarReais } from "@/lib/dinheiro";
import { linkWhatsapp, SITE } from "@/lib/loja";
import {
	adicionar,
	alterar,
	conciliar,
	type ItemSacola,
	LIMITE_POR_ITEM,
	lerSacola,
	type VarianteConferida,
} from "@/lib/sacola";

const CHAVE = "xf:sacola";

type Contexto = {
	itens: ItemSacola[];
	adicionar: (varianteId: string) => void;
	abrir: () => void;
};

const SacolaContexto = createContext<Contexto>({
	itens: [],
	adicionar: () => {},
	abrir: () => {},
});

export const useSacola = () => useContext(SacolaContexto);

type Conferir = (ids: string[]) => Promise<VarianteConferida[]>;

export function Sacola({
	conferir,
	children,
}: {
	conferir: Conferir;
	children: ReactNode;
}) {
	const [itens, setItens] = useState<ItemSacola[]>([]);
	const [aberta, setAberta] = useState(false);

	useEffect(() => {
		const carregar = () => setItens(lerSacola(localStorage.getItem(CHAVE)));
		carregar();
		window.addEventListener("storage", carregar);
		return () => window.removeEventListener("storage", carregar);
	}, []);

	const atualizar = useCallback(
		(mudar: (atuais: ItemSacola[]) => ItemSacola[]) => {
			setItens((atuais) => {
				const novos = mudar(atuais);
				localStorage.setItem(CHAVE, JSON.stringify(novos));
				return novos;
			});
		},
		[],
	);

	const valor: Contexto = {
		itens,
		adicionar: (id) => atualizar((atuais) => adicionar(atuais, id)),
		abrir: () => setAberta(true),
	};

	return (
		<SacolaContexto value={valor}>
			{children}
			<Gaveta
				aberta={aberta}
				aoFechar={() => setAberta(false)}
				titulo="Sua sacola"
			>
				{aberta && (
					<ConteudoSacola
						itens={itens}
						conferir={conferir}
						atualizar={atualizar}
					/>
				)}
			</Gaveta>
		</SacolaContexto>
	);
}

function ConteudoSacola({
	itens,
	conferir,
	atualizar,
}: {
	itens: ItemSacola[];
	conferir: Conferir;
	atualizar: (mudar: (atuais: ItemSacola[]) => ItemSacola[]) => void;
}) {
	const [conferidas, setConferidas] = useState<VarianteConferida[] | null>(
		null,
	);
	const [avisos, setAvisos] = useState<string[]>([]);
	const [, iniciar] = useTransition();

	// biome-ignore lint/correctness/useExhaustiveDependencies: confere preço e estoque uma vez a cada abertura
	useEffect(() => {
		if (!itens.length) return setConferidas([]);
		iniciar(async () => {
			const atuais = await conferir(itens.map((i) => i.varianteId));
			const resultado = conciliar(itens, atuais);
			setConferidas(atuais);
			setAvisos(resultado.avisos);
			if (resultado.avisos.length) atualizar(() => resultado.itens);
		});
	}, []);

	if (!conferidas)
		return (
			<div aria-busy className="flex flex-col gap-4">
				{itens.map((i) => (
					<div key={i.varianteId} className="flex gap-3">
						<Esqueleto className="aspect-4/5 w-16" />
						<div className="flex flex-1 flex-col gap-2">
							<Esqueleto className="h-5 w-4/5" />
							<Esqueleto className="h-4 w-1/3" />
						</div>
					</div>
				))}
			</div>
		);

	const { linhas, total } = conciliar(itens, conferidas);

	if (!linhas.length)
		return (
			<div className="flex flex-col gap-4">
				{avisos.map((a) => (
					<p key={a} className="bg-amarelo p-3 text-small text-bordo">
						{a}
					</p>
				))}
				<p className="text-suave">Sua sacola está vazia por enquanto.</p>
			</div>
		);

	const pedido = [
		"Olá! Quero fazer este pedido:",
		...linhas.map(
			(l) =>
				`• ${l.quantidade}x ${l.nome}${[l.cor, l.tamanho].some(Boolean) ? ` (${[l.cor, l.tamanho].filter(Boolean).join(", ")})` : ""}: ${formatarReais(l.preco * l.quantidade)}\n  ${SITE}/p/${l.slug}`,
		),
		`Total: ${formatarReais(total)}`,
	].join("\n");

	return (
		<div className="flex flex-col gap-6">
			{avisos.length > 0 && (
				<div
					role="status"
					className="entra flex flex-col gap-1 bg-amarelo p-3 text-small text-bordo"
				>
					{avisos.map((a) => (
						<p key={a}>{a}</p>
					))}
				</div>
			)}
			<ul className="flex flex-col divide-y divide-linha">
				{linhas.map((l) => {
					const detalhe = [l.cor, l.tamanho].filter(Boolean).join(" · ");
					return (
						<li key={l.id} className="entra flex gap-3 py-4 first:pt-0">
							{l.foto ? (
								// biome-ignore lint/performance/noImgElement: miniatura já comprimida no envio
								<img
									src={l.foto}
									alt=""
									width={64}
									height={80}
									className="aspect-4/5 w-16 object-cover"
								/>
							) : (
								<span aria-hidden className="aspect-4/5 w-16 bg-linha" />
							)}
							<div className="flex min-w-0 flex-1 flex-col gap-1">
								<Link
									href={`/p/${l.slug}`}
									className="leading-snug underline-offset-4 hover:underline"
								>
									{l.nome}
								</Link>
								{detalhe && (
									<span className="text-small text-suave">{detalhe}</span>
								)}
								<span className="font-semibold">
									{formatarReais(l.preco * l.quantidade)}
								</span>
								<div className="-ml-3 flex items-center">
									<button
										type="button"
										aria-label={`Diminuir quantidade de ${l.nome}`}
										onClick={() =>
											atualizar((a) => alterar(a, l.id, l.quantidade - 1))
										}
										className="botao min-h-11 px-3"
									>
										−
									</button>
									<output
										aria-label={`Quantidade de ${l.nome}`}
										className="min-w-6 text-center tabular-nums"
									>
										{l.quantidade}
									</output>
									<button
										type="button"
										aria-label={`Aumentar quantidade de ${l.nome}`}
										disabled={
											l.quantidade >= Math.min(l.estoque, LIMITE_POR_ITEM)
										}
										onClick={() =>
											atualizar((a) => alterar(a, l.id, l.quantidade + 1))
										}
										className="botao min-h-11 px-3"
									>
										+
									</button>
									<button
										type="button"
										onClick={() => atualizar((a) => alterar(a, l.id, 0))}
										className="botao ml-auto min-h-11 px-3 text-small font-normal text-suave underline-offset-4 hover:underline"
									>
										Remover
									</button>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
			<div className="flex items-baseline justify-between border-t border-linha pt-4">
				<span>Total</span>
				<span className="text-lead font-semibold">{formatarReais(total)}</span>
			</div>
			<a
				href={linkWhatsapp(pedido)}
				target="_blank"
				rel="noopener"
				className="botao bg-vermelho text-papel hover:bg-bordo"
			>
				Finalizar pelo WhatsApp
			</a>
			<p className="text-small text-suave">
				Frete grátis em Belém. O pagamento online chega em breve.
			</p>
		</div>
	);
}

export function BotaoSacola() {
	const { itens, abrir } = useSacola();
	const quantidade = itens.reduce((soma, i) => soma + i.quantidade, 0);
	return (
		<button
			type="button"
			onClick={abrir}
			aria-label={
				quantidade
					? `Sacola, ${quantidade} ${quantidade === 1 ? "peça" : "peças"}`
					: "Sacola vazia"
			}
			className="botao relative min-h-11 px-3"
		>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
				<path d="M5 8h14l-1 13H6L5 8Z" stroke="currentColor" strokeWidth="2" />
				<path
					d="M9 8V6a3 3 0 0 1 6 0v2"
					stroke="currentColor"
					strokeWidth="2"
				/>
			</svg>
			{quantidade > 0 && (
				<span
					key={quantidade}
					className="entra absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-vermelho px-1 text-[0.8125rem] leading-5 font-semibold text-papel tabular-nums"
				>
					{quantidade}
				</span>
			)}
		</button>
	);
}
