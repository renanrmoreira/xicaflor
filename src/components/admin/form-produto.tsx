"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { gruposDeCategoria } from "@/lib/categorias";
import type { ProdutoEntrada } from "@/lib/produto";

type Raiz = {
	id: string;
	nome: string;
	vitrine: boolean;
	filhas: { id: string; nome: string; ativo: boolean }[];
};
type Linha = {
	chave: number;
	id?: string;
	cor: string;
	tamanho: string;
	preco: string;
	estoque: string;
};

type Props = {
	categorias: Raiz[];
	inicial?: Omit<ProdutoEntrada, "variantes"> & {
		variantes: Omit<Linha, "chave">[];
	};
	acao: (entrada: ProdutoEntrada) => Promise<{ erro: string } | undefined>;
};

let proxima = 0;
const novaLinha = (dados: Partial<Linha> = {}): Linha => ({
	chave: proxima++,
	cor: "",
	tamanho: "",
	preco: "",
	estoque: "0",
	...dados,
});

export function FormProduto({ categorias, inicial, acao }: Props) {
	const [categoria, setCategoria] = useState(inicial?.categoria_id ?? "");
	const [linhas, setLinhas] = useState<Linha[]>(() =>
		inicial?.variantes.length
			? inicial.variantes.map((v) => novaLinha(v))
			: [novaLinha()],
	);
	const [erro, setErro] = useState("");
	const grupos = gruposDeCategoria(categorias, inicial?.categoria_id ?? "");
	const vazias = grupos.filter((g) => !g.opcoes.length);
	const [pendente, iniciar] = useTransition();
	const vitrine = categorias.some(
		(r) => r.vitrine && r.filhas.some((f) => f.id === categoria),
	);

	const alterar = (chave: number, campo: keyof Linha, valor: string) =>
		setLinhas((atual) =>
			atual.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)),
		);

	const adicionarTamanhos = () => {
		const ultimo = linhas.at(-1);
		const novas = ["P", "M", "G"].map((tamanho) =>
			novaLinha({ tamanho, cor: ultimo?.cor, preco: ultimo?.preco }),
		);
		setLinhas((atual) => [...atual.filter((l) => l.tamanho), ...novas]);
	};

	const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
		evento.preventDefault();
		const form = new FormData(evento.currentTarget);
		setErro("");
		iniciar(async () => {
			const resultado = await acao({
				id: inicial?.id,
				nome: String(form.get("nome")),
				descricao: String(form.get("descricao")),
				marca: String(form.get("marca")),
				categoria_id: categoria,
				ativo: form.get("ativo") === "on",
				destaque: form.get("destaque") === "on",
				variantes: vitrine ? [] : linhas.map(({ chave, ...v }) => v),
			});
			setErro(resultado?.erro ?? "");
		});
	};

	return (
		<form onSubmit={enviar} className="flex max-w-2xl flex-col gap-5">
			<Campo rotulo="Nome" name="nome" defaultValue={inicial?.nome} required />
			<div className="flex flex-col gap-1.5">
				<label htmlFor="categoria" className="text-small font-semibold">
					Categoria
				</label>
				<select
					id="categoria"
					value={categoria}
					onChange={(e) => setCategoria(e.target.value)}
					required
					className="min-h-12 border border-linha bg-papel px-3"
				>
					<option value="">Escolha…</option>
					{grupos.map((g) =>
						g.opcoes.length ? (
							<optgroup key={g.id} label={g.rotulo}>
								{g.opcoes.map((f) => (
									<option key={f.id} value={f.id}>
										{f.nome}
									</option>
								))}
							</optgroup>
						) : (
							<option key={g.id} disabled>
								{g.nome}: crie subcategorias primeiro
							</option>
						),
					)}
				</select>
				{vazias.length > 0 && (
					<p className="text-small text-suave">
						A peça entra numa subcategoria (Vestidos, Blusas…).{" "}
						{vazias.map((g) => g.nome).join(" e ")} ainda não tem nenhuma.{" "}
						<Link
							href="/admin/categorias"
							className="font-semibold text-vermelho underline underline-offset-4"
						>
							Criar em Categorias
						</Link>
					</p>
				)}
			</div>
			<div className="flex flex-col gap-1.5">
				<label htmlFor="descricao" className="text-small font-semibold">
					Descrição
				</label>
				<textarea
					id="descricao"
					name="descricao"
					rows={4}
					defaultValue={inicial?.descricao}
					className="border border-linha p-3.5 focus:border-tinta"
				/>
			</div>
			<Campo
				rotulo="Marca (opcional)"
				name="marca"
				defaultValue={inicial?.marca}
			/>

			{vitrine ? (
				<p className="entra bg-amarelo p-4 text-small text-bordo">
					Produto de vitrine: aparece na loja com o botão “Comprar na loja”, sem
					preço nem estoque.
				</p>
			) : (
				<fieldset className="entra flex flex-col gap-3">
					<legend className="display mb-2 text-[2rem]">Variantes</legend>
					{linhas.map((l, i) => (
						<div
							key={l.chave}
							className="entra grid grid-cols-2 gap-x-3 gap-y-2 border-b border-linha pb-4 sm:grid-cols-[1fr_6rem_8rem_6rem_auto]"
						>
							<Campo
								rotulo="Cor"
								value={l.cor}
								onChange={(e) => alterar(l.chave, "cor", e.target.value)}
							/>
							<Campo
								rotulo="Tamanho"
								value={l.tamanho}
								onChange={(e) => alterar(l.chave, "tamanho", e.target.value)}
							/>
							<Campo
								rotulo="Preço (R$)"
								inputMode="decimal"
								placeholder="189,90"
								value={l.preco}
								onChange={(e) => alterar(l.chave, "preco", e.target.value)}
							/>
							<Campo
								rotulo="Estoque"
								type="number"
								min={0}
								inputMode="numeric"
								value={l.estoque}
								onChange={(e) => alterar(l.chave, "estoque", e.target.value)}
							/>
							<Botao
								type="button"
								variante="fantasma"
								className="col-span-2 self-end sm:col-span-1"
								disabled={linhas.length === 1}
								onClick={() =>
									setLinhas((atual) => atual.filter((x) => x.chave !== l.chave))
								}
								aria-label={`Remover variante ${i + 1}`}
							>
								Remover
							</Botao>
						</div>
					))}
					<div className="flex flex-wrap gap-3">
						<Botao
							type="button"
							variante="secundario"
							onClick={() => setLinhas((a) => [...a, novaLinha()])}
						>
							Adicionar variante
						</Botao>
						<Botao
							type="button"
							variante="fantasma"
							onClick={adicionarTamanhos}
						>
							Adicionar P, M e G
						</Botao>
					</div>
				</fieldset>
			)}

			<label className="flex min-h-11 items-center gap-3">
				<input
					type="checkbox"
					name="ativo"
					defaultChecked={inicial?.ativo ?? true}
					className="size-5 accent-vermelho"
				/>
				Visível na loja
			</label>
			<label className="flex min-h-11 items-center gap-3">
				<input
					type="checkbox"
					name="destaque"
					defaultChecked={inicial?.destaque}
					className="size-5 accent-vermelho"
				/>
				Destaque na página inicial
			</label>

			{erro && (
				<p role="alert" className="entra text-vermelho">
					{erro}
				</p>
			)}
			<Botao
				type="submit"
				pendente={pendente}
				rotuloPendente="Salvando"
				className="self-start"
			>
				Salvar produto
			</Botao>
		</form>
	);
}
