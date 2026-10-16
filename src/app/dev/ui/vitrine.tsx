"use client";

import Link from "next/link";
import { useState } from "react";
import { useAviso } from "@/components/ui/avisos";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Esqueleto } from "@/components/ui/esqueleto";
import { Gaveta } from "@/components/ui/gaveta";
import { Logo, Wordmark } from "@/components/ui/marca";

const cores = [
	"amarelo",
	"vermelho",
	"bordo",
	"tinta",
	"suave",
	"papel",
	"linha",
];

function Secao({
	titulo,
	children,
}: {
	titulo: string;
	children: React.ReactNode;
}) {
	return (
		<section className="entra flex flex-col gap-5 border-t border-linha px-(--margem) py-10">
			<h2 className="display text-head">{titulo}</h2>
			{children}
		</section>
	);
}

export function Vitrine() {
	const avisar = useAviso();
	const [gaveta, setGaveta] = useState(false);
	const [pendente, setPendente] = useState(false);
	const [carregando, setCarregando] = useState(true);

	const simularEnvio = () => {
		setPendente(true);
		setTimeout(() => {
			setPendente(false);
			avisar("Peça adicionada à sacola");
		}, 1500);
	};

	return (
		<main>
			<header className="flex min-h-[70svh] flex-col justify-between bg-amarelo px-(--margem) pt-6 pb-4 text-vermelho">
				<Wordmark className="w-36" />
				<h1 className="display entra -mb-[0.12em] text-display text-bordo">
					Xica Flor
				</h1>
			</header>

			<Secao titulo="Marca">
				<div className="flex flex-wrap items-center gap-8">
					<Logo className="w-40 text-vermelho" />
					<div className="bg-vermelho p-6">
						<Wordmark className="w-48 text-amarelo" />
					</div>
					<div className="bg-bordo p-6">
						<Wordmark className="w-48 text-papel" />
					</div>
				</div>
			</Secao>

			<Secao titulo="Cores">
				<ul className="grid grid-cols-2 gap-(--vao) md:grid-cols-7">
					{cores.map((c) => (
						<li key={c} className="flex flex-col gap-2 text-small">
							<span
								className="aspect-square border border-linha"
								style={{ background: `var(--color-${c})` }}
							/>
							--{c}
						</li>
					))}
				</ul>
			</Secao>

			<Secao titulo="Tipografia">
				<p className="display text-head">Vestidos</p>
				<p className="text-lead">R$ 189,90 · em até 3x de R$ 63,30 sem juros</p>
				<p className="max-w-[62ch]">
					Vestido midi em viscose com amarração na cintura. Tecido leve, ideal
					para o calor de Belém. Entregamos na sua casa em até 2 dias úteis.
				</p>
				<p className="text-small text-suave">
					Pix, cartão em até 3x · frete grátis em Belém
				</p>
			</Secao>

			<Secao titulo="Botões">
				<div className="flex flex-wrap gap-3">
					<Botao
						pendente={pendente}
						rotuloPendente="Adicionando"
						onClick={simularEnvio}
					>
						Adicionar à sacola
					</Botao>
					<Botao variante="secundario">Ver medidas</Botao>
					<Botao variante="fantasma">Continuar comprando</Botao>
					<Botao disabled>Esgotado</Botao>
				</div>
			</Secao>

			<Secao titulo="Campos">
				<form
					className="grid max-w-md gap-4"
					onSubmit={(e) => e.preventDefault()}
				>
					<Campo
						rotulo="E-mail"
						type="email"
						placeholder="voce@email.com"
						autoComplete="email"
					/>
					<Campo
						rotulo="CEP"
						inputMode="numeric"
						defaultValue="6600"
						erro="CEP incompleto: são 8 números"
					/>
				</form>
			</Secao>

			<Secao titulo="Carregando">
				<Botao
					variante="secundario"
					className="self-start"
					onClick={() => setCarregando((v) => !v)}
				>
					{carregando ? "Mostrar conteúdo" : "Mostrar esqueleto"}
				</Botao>
				<div className="grid grid-cols-2 gap-(--vao) md:grid-cols-4">
					{[1, 2, 3, 4].map((n) =>
						carregando ? (
							<div key={n} className="flex flex-col gap-2">
								<Esqueleto className="aspect-4/5" />
								<Esqueleto className="h-5 w-4/5" />
								<Esqueleto className="h-5 w-2/5" />
							</div>
						) : (
							<div
								key={n}
								className="entra flex flex-col gap-2"
								style={{ transitionDelay: `${n * 60}ms` }}
							>
								<div className="aspect-4/5 bg-amarelo" />
								<p className="font-semibold">Vestido Flor de Ipê</p>
								<p>R$ 189,90</p>
							</div>
						),
					)}
				</div>
			</Secao>

			<Secao titulo="Gaveta e aviso">
				<div className="flex flex-wrap gap-3">
					<Botao variante="secundario" onClick={() => setGaveta(true)}>
						Abrir sacola
					</Botao>
					<Botao variante="secundario" onClick={() => avisar("Endereço salvo")}>
						Mostrar aviso
					</Botao>
					<Link
						href="/"
						className="botao text-tinta underline-offset-4 hover:underline"
					>
						Navegar (barra de progresso)
					</Link>
				</div>
			</Secao>

			<Gaveta
				aberta={gaveta}
				aoFechar={() => setGaveta(false)}
				titulo="Sua sacola"
			>
				<p className="text-suave">Sua sacola está vazia por enquanto.</p>
			</Gaveta>
		</main>
	);
}
