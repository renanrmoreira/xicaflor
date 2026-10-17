"use client";

import Link from "next/link";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Botao, classeBotao } from "@/components/ui/botao";
import { Esqueleto } from "@/components/ui/esqueleto";
import { Gaveta } from "@/components/ui/gaveta";
import { formatarReais } from "@/lib/dinheiro";
import { linkWhatsapp, SITE } from "@/lib/loja";
import {
	adicionar,
	alterar,
	conciliar,
	detalheVariante,
	type ItemSacola,
	LIMITE_POR_ITEM,
	lerSacola,
	mensagemPedido,
	type VarianteConferida,
} from "@/lib/sacola";

const CHAVE = "xf:sacola";

type Mudanca = (atuais: ItemSacola[]) => ItemSacola[];
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

function ler() {
	try {
		return lerSacola(localStorage.getItem(CHAVE));
	} catch {
		return [];
	}
}

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
	const carregada = useRef(false);

	useEffect(() => {
		const carregar = () => setItens(ler());
		carregar();
		carregada.current = true;
		window.addEventListener("storage", carregar);
		return () => window.removeEventListener("storage", carregar);
	}, []);

	useEffect(() => {
		if (!carregada.current) return;
		try {
			localStorage.setItem(CHAVE, JSON.stringify(itens));
		} catch {
			// Sem armazenamento (aba anônima ou cota cheia), a sacola vale só enquanto a página estiver aberta.
		}
	}, [itens]);

	const valor: Contexto = {
		itens,
		adicionar: (id) => setItens((atuais) => adicionar(atuais, id)),
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
						atualizar={setItens}
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
	atualizar: (mudar: Mudanca) => void;
}) {
	const [conferidas, setConferidas] = useState<VarianteConferida[] | null>(
		null,
	);
	const [avisos, setAvisos] = useState<string[]>([]);
	const [falhou, setFalhou] = useState(false);
	const [tentativa, setTentativa] = useState(0);
	const ultimos = useRef(itens);
	ultimos.current = itens;

	const faltando = itens.filter(
		(i) => !conferidas?.some((c) => c.id === i.varianteId),
	);
	const chave = faltando
		.map((i) => i.varianteId)
		.toSorted()
		.join(",");

	// biome-ignore lint/correctness/useExhaustiveDependencies: confere de novo só quando entra uma variante ainda não conferida
	useEffect(() => {
		if (!chave) return setConferidas((atual) => atual ?? []);
		let ativo = true;
		setFalhou(false);
		conferir(ultimos.current.map((i) => i.varianteId))
			.then((novas) => {
				if (!ativo) return;
				const { avisos } = conciliar(ultimos.current, novas);
				setConferidas(novas);
				setAvisos(avisos);
				if (avisos.length)
					atualizar((atuais) => conciliar(atuais, novas).itens);
			})
			.catch(() => ativo && setFalhou(true));
		return () => {
			ativo = false;
		};
	}, [chave, tentativa]);

	if (falhou)
		return (
			<div role="alert" className="flex flex-col items-start gap-4">
				<p>Não deu para conferir a sacola agora.</p>
				<Botao variante="secundario" onClick={() => setTentativa((t) => t + 1)}>
					Tentar de novo
				</Botao>
			</div>
		);

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
			{linhas.length === 0 ? (
				<p className="text-suave">Sua sacola está vazia por enquanto.</p>
			) : (
				<>
					<ul className="flex flex-col divide-y divide-linha">
						{linhas.map((l) => {
							const detalhe = detalheVariante(l, " · ");
							return (
								<li key={l.id} className="flex gap-3 py-4 first:pt-0">
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
											<Botao
												variante="fantasma"
												className="px-3"
												aria-label={`Diminuir quantidade de ${l.nome}`}
												onClick={() =>
													atualizar((a) => alterar(a, l.id, l.quantidade - 1))
												}
											>
												−
											</Botao>
											<output
												aria-label={`Quantidade de ${l.nome}`}
												className="min-w-6 text-center tabular-nums"
											>
												{l.quantidade}
											</output>
											<Botao
												variante="fantasma"
												className="px-3"
												aria-label={`Aumentar quantidade de ${l.nome}`}
												disabled={
													l.quantidade >= Math.min(l.estoque, LIMITE_POR_ITEM)
												}
												onClick={() =>
													atualizar((a) => alterar(a, l.id, l.quantidade + 1))
												}
											>
												+
											</Botao>
											<Botao
												variante="fantasma"
												className="ml-auto px-3 text-small font-normal text-suave"
												onClick={() => atualizar((a) => alterar(a, l.id, 0))}
											>
												Remover
											</Botao>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
					<div className="flex items-baseline justify-between border-t border-linha pt-4">
						<span>Total</span>
						<span className="text-lead font-semibold">
							{formatarReais(total)}
						</span>
					</div>
					<a
						href={linkWhatsapp(mensagemPedido(linhas, total, SITE))}
						target="_blank"
						rel="noopener"
						className={classeBotao()}
					>
						Finalizar pelo WhatsApp
					</a>
					<p className="text-small text-suave">
						Frete grátis em Belém. O pagamento online chega em breve.
					</p>
				</>
			)}
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
				<span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-vermelho px-1 text-[0.8125rem] leading-5 font-semibold text-papel tabular-nums">
					{quantidade}
				</span>
			)}
		</button>
	);
}
