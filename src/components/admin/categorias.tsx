"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useAviso } from "@/components/ui/avisos";
import { BotaoEnviar } from "@/components/ui/botao-enviar";
import { Campo } from "@/components/ui/campo";

type Resultado = { erro?: string; ok?: boolean } | undefined;
type AcaoForm = (estado: Resultado, dados: FormData) => Promise<Resultado>;

type Categoria = {
	id: string;
	nome: string;
	ativo: boolean;
	link_vitrine: string | null;
	slug: string;
	filhas: Categoria[];
};

export type AcoesCategorias = {
	criar: (
		paiId: string,
		estado: Resultado,
		dados: FormData,
	) => Promise<Resultado>;
	renomear: (
		id: string,
		estado: Resultado,
		dados: FormData,
	) => Promise<Resultado>;
	alternar: (id: string, ativo: boolean) => Promise<void>;
	mover: (id: string, direcao: -1 | 1) => Promise<void>;
	salvarLink: (
		id: string,
		estado: Resultado,
		dados: FormData,
	) => Promise<Resultado>;
};

function FormSimples({
	acao,
	rotulo,
	nome,
	valor,
	botao,
	limparAoSalvar,
	aoSalvar,
	confirmacao,
	...campo
}: {
	acao: AcaoForm;
	rotulo: string;
	nome: string;
	valor?: string;
	botao: string;
	limparAoSalvar?: boolean;
	aoSalvar?: () => void;
	confirmacao: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
	const [estado, enviar] = useActionState(acao, undefined);
	const form = useRef<HTMLFormElement>(null);
	const avisar = useAviso();
	useEffect(() => {
		if (!estado?.ok) return;
		avisar(confirmacao);
		if (limparAoSalvar) form.current?.reset();
		aoSalvar?.();
	}, [estado, limparAoSalvar, aoSalvar, avisar, confirmacao]);
	return (
		<form ref={form} action={enviar} className="flex items-end gap-2">
			<Campo
				rotulo={rotulo}
				name={nome}
				defaultValue={valor}
				erro={estado?.erro}
				className="flex-1"
				{...campo}
			/>
			<BotaoEnviar variante="secundario" className="shrink-0">
				{botao}
			</BotaoEnviar>
		</form>
	);
}

function Linha({
	categoria,
	acoes,
	primeira,
	ultima,
}: {
	categoria: Categoria;
	acoes: AcoesCategorias;
	primeira: boolean;
	ultima: boolean;
}) {
	const [editando, setEditando] = useState(false);
	if (editando)
		return (
			<li className="entra py-3">
				<FormSimples
					acao={acoes.renomear.bind(null, categoria.id)}
					rotulo={`Novo nome de ${categoria.nome}`}
					nome="nome"
					valor={categoria.nome}
					botao="Salvar"
					confirmacao="Categoria renomeada"
					aoSalvar={() => setEditando(false)}
					autoFocus
				/>
			</li>
		);
	return (
		<li className="flex flex-wrap items-center gap-x-1 py-2">
			<span
				className={`min-w-0 flex-1 basis-40 break-words ${categoria.ativo ? "" : "text-suave line-through"}`}
			>
				{categoria.nome}
			</span>
			<div className="-mr-2.5 flex">
				<form action={acoes.mover.bind(null, categoria.id, -1)}>
					<BotaoEnviar
						variante="fantasma"
						className="px-2.5"
						disabled={primeira}
						aria-label={`Subir ${categoria.nome}`}
					>
						↑
					</BotaoEnviar>
				</form>
				<form action={acoes.mover.bind(null, categoria.id, 1)}>
					<BotaoEnviar
						variante="fantasma"
						className="px-2.5"
						disabled={ultima}
						aria-label={`Descer ${categoria.nome}`}
					>
						↓
					</BotaoEnviar>
				</form>
				<button
					type="button"
					className="botao px-2.5 underline-offset-4 hover:underline"
					onClick={() => setEditando(true)}
				>
					Editar
				</button>
				<form
					action={acoes.alternar.bind(null, categoria.id, !categoria.ativo)}
				>
					<BotaoEnviar variante="fantasma" className="px-2.5">
						{categoria.ativo ? "Desativar" : "Ativar"}
					</BotaoEnviar>
				</form>
			</div>
		</li>
	);
}

export function ArvoreCategorias({
	raizes,
	acoes,
}: {
	raizes: Categoria[];
	acoes: AcoesCategorias;
}) {
	return (
		<div className="flex flex-col gap-12">
			{raizes.map((raiz) => (
				<section key={raiz.id} className="entra flex flex-col gap-4">
					<h2 className="display text-[2.5rem]">{raiz.nome}</h2>
					{raiz.slug === "beleza" && (
						<FormSimples
							acao={acoes.salvarLink.bind(null, raiz.id)}
							rotulo="Link da loja de afiliada"
							nome="link"
							type="url"
							inputMode="url"
							placeholder="https://"
							valor={raiz.link_vitrine ?? ""}
							botao="Salvar"
							confirmacao="Link salvo"
						/>
					)}
					{raiz.filhas.length ? (
						<ul className="divide-y divide-linha border-y border-linha">
							{raiz.filhas.map((filha, i) => (
								<Linha
									key={filha.id}
									categoria={filha}
									acoes={acoes}
									primeira={i === 0}
									ultima={i === raiz.filhas.length - 1}
								/>
							))}
						</ul>
					) : (
						<p className="border-y border-linha py-4 text-suave">
							Nenhuma subcategoria ainda.
						</p>
					)}
					<FormSimples
						acao={acoes.criar.bind(null, raiz.id)}
						rotulo={`Nova subcategoria em ${raiz.nome}`}
						nome="nome"
						placeholder="Ex.: Vestidos"
						botao="Adicionar"
						confirmacao="Subcategoria criada"
						limparAoSalvar
					/>
				</section>
			))}
		</div>
	);
}
