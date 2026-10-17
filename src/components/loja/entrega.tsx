"use client";

import { useEffect, useState, useTransition } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { descreverFrete, type Frete } from "@/lib/frete";

const CHAVE_CEP = "xf:cep";

export type CalcularFrete = (cep: string) => Promise<Frete | null>;

type Props = {
	frete: Frete | null;
	aoMudar: (frete: Frete | null) => void;
	calcular: CalcularFrete;
};

export function Entrega({ frete, aoMudar, calcular }: Props) {
	const [retirada, setRetirada] = useState(frete?.tipo === "retirada");
	const [cep, setCep] = useState("");
	const [erro, setErro] = useState("");
	const [pendente, iniciar] = useTransition();

	useEffect(() => {
		try {
			setCep(localStorage.getItem(CHAVE_CEP) ?? "");
		} catch {}
	}, []);

	const escolher = (paraRetirar: boolean) => {
		setRetirada(paraRetirar);
		aoMudar(paraRetirar ? { tipo: "retirada" } : null);
	};

	const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
		evento.preventDefault();
		setErro("");
		iniciar(async () => {
			try {
				const resultado = await calcular(cep);
				if (!resultado) return setErro("Digite um CEP com 8 números.");
				localStorage.setItem(CHAVE_CEP, cep);
				aoMudar(resultado);
			} catch {
				setErro("Não foi possível calcular agora. Tente de novo.");
			}
		});
	};

	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="mb-2 text-small font-semibold">Entrega</legend>
			{[
				{ rotulo: "Entregar no meu endereço", valor: false },
				{ rotulo: "Retirar na loja (grátis)", valor: true },
			].map((o) => (
				<label
					key={o.rotulo}
					className="flex min-h-11 cursor-pointer items-center gap-3"
				>
					<input
						type="radio"
						name="modalidade"
						checked={retirada === o.valor}
						onChange={() => escolher(o.valor)}
						className="size-5 accent-vermelho"
					/>
					{o.rotulo}
				</label>
			))}
			{!retirada && (
				<form onSubmit={enviar} className="flex items-end gap-2">
					<Campo
						rotulo="CEP"
						value={cep}
						onChange={(e) => {
							setCep(e.target.value);
							if (frete) aoMudar(null);
						}}
						inputMode="numeric"
						autoComplete="postal-code"
						placeholder="66000-000"
						erro={erro}
						className="min-w-0 flex-1"
					/>
					<Botao
						type="submit"
						variante="secundario"
						pendente={pendente}
						className="shrink-0"
					>
						Calcular
					</Botao>
				</form>
			)}
			{frete && frete.tipo !== "retirada" && !retirada && (
				<p role="status" className="entra text-small">
					{descreverFrete(frete)}
				</p>
			)}
		</fieldset>
	);
}
