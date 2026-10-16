"use client";

import Link from "next/link";
import { BotaoEnviar } from "@/components/ui/botao-enviar";

type Variante = {
	id: string;
	cor: string | null;
	tamanho: string | null;
	estoque: number;
};
type Produto = {
	id: string;
	nome: string;
	ativo: boolean;
	categorias: { nome: string } | null;
	variantes: Variante[];
};

type Props = {
	produtos: Produto[];
	ajustar: (varianteId: string, delta: 1 | -1) => Promise<void>;
	alternar: (id: string, ativo: boolean) => Promise<void>;
};

export function ListaProdutos({ produtos, ajustar, alternar }: Props) {
	if (!produtos.length)
		return (
			<p className="border-y border-linha py-6 text-suave">
				Nenhum produto ainda. Cadastre a primeira peça.
			</p>
		);
	return (
		<ul className="divide-y divide-linha border-y border-linha">
			{produtos.map((p) => (
				<li key={p.id} className="entra flex flex-col gap-3 py-4">
					<div className="flex flex-wrap items-baseline justify-between gap-x-3">
						<div className="min-w-0">
							<p
								className={`font-semibold ${p.ativo ? "" : "text-suave line-through"}`}
							>
								{p.nome}
							</p>
							<p className="text-small text-suave">{p.categorias?.nome}</p>
						</div>
						<div className="-mr-2.5 flex">
							<Link
								href={`/admin/produtos/${p.id}`}
								className="botao px-2.5 underline-offset-4 hover:underline"
							>
								Editar
							</Link>
							<form action={alternar.bind(null, p.id, !p.ativo)}>
								<BotaoEnviar variante="fantasma" className="px-2.5">
									{p.ativo ? "Ocultar" : "Mostrar"}
								</BotaoEnviar>
							</form>
						</div>
					</div>
					{p.variantes.length > 0 && (
						<ul className="flex flex-wrap gap-2">
							{p.variantes.map((v) => {
								const rotulo =
									[v.cor, v.tamanho].filter(Boolean).join(" · ") || "Único";
								return (
									<li
										key={v.id}
										className={`flex items-center border ${v.estoque ? "border-linha" : "border-vermelho"}`}
									>
										<span className="px-3 text-small">{rotulo}</span>
										<form action={ajustar.bind(null, v.id, -1)}>
											<BotaoEnviar
												variante="fantasma"
												className="min-h-11 px-3"
												disabled={!v.estoque}
												aria-label={`Diminuir estoque de ${rotulo}`}
											>
												−
											</BotaoEnviar>
										</form>
										<output
											aria-label={`Estoque de ${rotulo}`}
											className="min-w-6 text-center tabular-nums"
										>
											{v.estoque}
										</output>
										<form action={ajustar.bind(null, v.id, 1)}>
											<BotaoEnviar
												variante="fantasma"
												className="min-h-11 px-3"
												aria-label={`Aumentar estoque de ${rotulo}`}
											>
												+
											</BotaoEnviar>
										</form>
									</li>
								);
							})}
						</ul>
					)}
				</li>
			))}
		</ul>
	);
}
