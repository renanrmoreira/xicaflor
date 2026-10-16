"use client";

import { useState } from "react";
import { formatarReais } from "@/lib/dinheiro";
import { linkWhatsapp, type VarianteLoja } from "@/lib/loja";

type Props = { nome: string; url: string; variantes: VarianteLoja[] };

function Opcoes({
	rotulo,
	valores,
	escolhido,
	esgotado,
	aoEscolher,
}: {
	rotulo: string;
	valores: string[];
	escolhido: string | null;
	esgotado: (valor: string) => boolean;
	aoEscolher: (valor: string) => void;
}) {
	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="mb-2 text-small font-semibold">
				{rotulo}
				{escolhido && (
					<span className="font-normal text-suave">: {escolhido}</span>
				)}
			</legend>
			<div className="flex flex-wrap gap-2">
				{valores.map((valor) => (
					<label
						key={valor}
						className="botao min-h-11 min-w-12 cursor-pointer border border-linha px-3 font-normal has-checked:border-tinta has-checked:bg-tinta has-checked:text-papel has-disabled:cursor-not-allowed has-disabled:text-suave has-disabled:line-through has-focus-visible:outline-2 has-focus-visible:outline-vermelho"
					>
						<input
							type="radio"
							name={rotulo}
							value={valor}
							checked={escolhido === valor}
							disabled={esgotado(valor)}
							onChange={() => aoEscolher(valor)}
							className="sr-only"
						/>
						{valor}
					</label>
				))}
			</div>
		</fieldset>
	);
}

export function Compra({ nome, url, variantes }: Props) {
	const cores = [
		...new Set(variantes.map((v) => v.cor).filter((c): c is string => !!c)),
	];
	const unica = variantes.length === 1 ? variantes[0] : null;
	const [cor, setCor] = useState<string | null>(
		cores.length === 1 ? cores[0] : null,
	);
	const [tamanho, setTamanho] = useState<string | null>(null);

	const daCor = variantes.filter((v) => !cores.length || v.cor === cor);
	const tamanhos = [
		...new Set(daCor.map((v) => v.tamanho).filter((t): t is string => !!t)),
	];
	const escolhida =
		unica ??
		daCor.find(
			(v) =>
				(tamanhos.length ? v.tamanho === tamanho : true) &&
				(!cores.length || v.cor === cor),
		);
	const precos = variantes.map((v) => v.preco_centavos);
	const preco = escolhida?.preco_centavos ?? Math.min(...precos);
	const varia = !escolhida && new Set(precos).size > 1;
	const disponivel = escolhida && escolhida.estoque > 0;

	const falta =
		cores.length > 1 && !cor
			? "Escolha a cor"
			: tamanhos.length && !tamanho
				? "Escolha o tamanho"
				: null;
	const detalhe = [escolhida?.cor, escolhida?.tamanho]
		.filter(Boolean)
		.join(", ");
	const mensagem = `Olá! Quero comprar: ${nome}${detalhe ? ` (${detalhe})` : ""}, ${formatarReais(preco)}.`;

	return (
		<div className="flex flex-col gap-6">
			<p className="text-lead font-semibold">
				{varia && (
					<span className="text-small font-normal text-suave">
						a partir de{" "}
					</span>
				)}
				{formatarReais(preco)}
			</p>
			{cores.length > 1 && (
				<Opcoes
					rotulo="Cor"
					valores={cores}
					escolhido={cor}
					esgotado={(c) =>
						variantes.filter((v) => v.cor === c).every((v) => v.estoque === 0)
					}
					aoEscolher={(c) => {
						setCor(c);
						setTamanho(null);
					}}
				/>
			)}
			{tamanhos.length > 0 && (cores.length <= 1 || cor) && (
				<Opcoes
					rotulo="Tamanho"
					valores={tamanhos}
					escolhido={tamanho}
					esgotado={(t) =>
						daCor.filter((v) => v.tamanho === t).every((v) => v.estoque === 0)
					}
					aoEscolher={setTamanho}
				/>
			)}
			{escolhida &&
				!falta &&
				escolhida.estoque > 0 &&
				escolhida.estoque <= 2 && (
					<p className="entra text-small text-vermelho">
						{escolhida.estoque === 1
							? "Última peça"
							: `Últimas ${escolhida.estoque} peças`}
					</p>
				)}
			{falta || !disponivel ? (
				<button type="button" disabled className="botao bg-vermelho text-papel">
					{falta ?? "Esgotado"}
				</button>
			) : (
				<a
					href={linkWhatsapp(`${mensagem} ${url}`)}
					target="_blank"
					rel="noopener"
					className="botao entra bg-vermelho text-papel hover:bg-bordo"
				>
					Comprar pelo WhatsApp
				</a>
			)}
			<p className="text-small text-suave">
				Frete grátis em Belém. O pagamento online chega em breve; por enquanto a
				compra é finalizada pelo WhatsApp.
			</p>
		</div>
	);
}
