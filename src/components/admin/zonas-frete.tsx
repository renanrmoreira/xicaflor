"use client";

import { useActionState, useEffect } from "react";
import { useAviso } from "@/components/ui/avisos";
import { BotaoEnviar } from "@/components/ui/botao-enviar";
import { Campo } from "@/components/ui/campo";
import { textoDeCentavos } from "@/lib/dinheiro";
import { formatarCep } from "@/lib/frete";

type Zona = {
	id: string;
	nome: string;
	cep_inicio: string;
	cep_fim: string;
	preco_centavos: number | null;
	ativo: boolean;
};
type Resultado = { erro?: string; ok?: boolean } | undefined;
type Acoes = {
	salvar: (
		id: string | null,
		estado: Resultado,
		dados: FormData,
	) => Promise<Resultado>;
	alternar: (id: string, ativo: boolean) => Promise<void>;
};

function FormZona({ zona, acoes }: { zona?: Zona; acoes: Acoes }) {
	const [estado, enviar] = useActionState(
		acoes.salvar.bind(null, zona?.id ?? null),
		undefined,
	);
	const avisar = useAviso();
	useEffect(() => {
		if (estado?.ok) avisar(zona ? "Zona salva" : "Zona criada");
	}, [estado, avisar, zona]);

	return (
		<form
			action={enviar}
			className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-[1fr_8rem_8rem_8rem]"
		>
			<Campo
				rotulo="Nome"
				name="nome"
				defaultValue={zona?.nome}
				required
				className="col-span-2 sm:col-span-1"
			/>
			<Campo
				rotulo="CEP inicial"
				name="cep_inicio"
				inputMode="numeric"
				defaultValue={zona && formatarCep(zona.cep_inicio)}
				required
			/>
			<Campo
				rotulo="CEP final"
				name="cep_fim"
				inputMode="numeric"
				defaultValue={zona && formatarCep(zona.cep_fim)}
				required
			/>
			<Campo
				rotulo="Frete (R$)"
				name="preco_centavos"
				inputMode="decimal"
				placeholder="a combinar"
				defaultValue={
					zona?.preco_centavos != null
						? textoDeCentavos(zona.preco_centavos)
						: ""
				}
				className="col-span-2 sm:col-span-1"
			/>
			{estado?.erro && (
				<p role="alert" className="col-span-full text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<div className="col-span-full -ml-2.5 flex gap-1">
				<BotaoEnviar variante="secundario">
					{zona ? "Salvar" : "Criar zona"}
				</BotaoEnviar>
				{zona && (
					<BotaoEnviar
						variante="fantasma"
						formAction={acoes.alternar.bind(null, zona.id, !zona.ativo)}
					>
						{zona.ativo ? "Desativar" : "Ativar"}
					</BotaoEnviar>
				)}
			</div>
		</form>
	);
}

export function ZonasFrete({ zonas, acoes }: { zonas: Zona[]; acoes: Acoes }) {
	return (
		<div className="flex max-w-3xl flex-col gap-10">
			<p className="text-suave">
				Quando um CEP cai em mais de uma zona, vale a de faixa mais estreita.
				Deixe o frete vazio para "a combinar pelo WhatsApp". CEP fora de todas
				as zonas também fica a combinar.
			</p>
			<ul className="flex flex-col divide-y divide-linha border-y border-linha">
				{zonas.map((z) => (
					<li key={z.id} className={`py-6 ${z.ativo ? "" : "opacity-60"}`}>
						<FormZona zona={z} acoes={acoes} />
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-4">
				<h2 className="display text-[2rem]">Nova zona</h2>
				<FormZona acoes={acoes} />
			</section>
		</div>
	);
}
