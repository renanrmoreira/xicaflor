"use client";

import { useActionState, useEffect, useState } from "react";
import { useAviso } from "@/components/ui/avisos";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { formatarCep, limparCep } from "@/lib/frete";
import type { AcaoConta } from "@/lib/resultado";

const CAMPOS = [
	"nome",
	"telefone",
	"cep",
	"logradouro",
	"numero",
	"complemento",
	"bairro",
	"cidade",
	"uf",
] as const;
type Campos = Record<(typeof CAMPOS)[number], string>;

type Props = {
	inicial: Partial<Record<(typeof CAMPOS)[number], string | null>>;
	acao: AcaoConta;
};

export function FormPerfil({ inicial, acao }: Props) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	const [campos, setCampos] = useState<Campos>(
		() =>
			Object.fromEntries(CAMPOS.map((c) => [c, inicial[c] ?? ""])) as Campos,
	);
	const [buscandoCep, setBuscandoCep] = useState(false);
	const avisar = useAviso();

	useEffect(() => {
		if (estado?.ok) avisar("Dados salvos");
	}, [estado, avisar]);

	const mudar =
		(campo: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setCampos((atual) => ({ ...atual, [campo]: e.target.value }));

	const completarEndereco = async () => {
		const cep = limparCep(campos.cep);
		if (!cep) return;
		setBuscandoCep(true);
		try {
			const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(
				(res) => res.json(),
			);
			if (!r.erro)
				setCampos((atual) => ({
					...atual,
					cep: formatarCep(cep),
					logradouro: r.logradouro || atual.logradouro,
					bairro: r.bairro || atual.bairro,
					cidade: r.localidade || atual.cidade,
					uf: r.uf || atual.uf,
				}));
		} catch {
		} finally {
			setBuscandoCep(false);
		}
	};

	const campo = (
		nome: keyof Campos,
		rotulo: string,
		extra: React.InputHTMLAttributes<HTMLInputElement> = {},
	) => (
		<Campo
			rotulo={rotulo}
			name={nome}
			value={campos[nome]}
			onChange={mudar(nome)}
			{...extra}
		/>
	);

	return (
		<form action={enviar} className="grid max-w-xl grid-cols-2 gap-4">
			{campo("nome", "Nome", {
				autoComplete: "name",
				required: true,
				className: "col-span-2",
			})}
			{campo("telefone", "WhatsApp", {
				type: "tel",
				inputMode: "tel",
				autoComplete: "tel",
				placeholder: "(91) 90000-0000",
				className: "col-span-2",
			})}
			{campo("cep", buscandoCep ? "CEP (buscando endereço…)" : "CEP", {
				inputMode: "numeric",
				autoComplete: "postal-code",
				placeholder: "66000-000",
				onBlur: completarEndereco,
			})}
			{campo("uf", "UF", { autoComplete: "address-level1", maxLength: 2 })}
			{campo("logradouro", "Rua", {
				autoComplete: "address-line1",
				className: "col-span-2",
			})}
			{campo("numero", "Número", { inputMode: "numeric" })}
			{campo("complemento", "Complemento", { autoComplete: "address-line2" })}
			{campo("bairro", "Bairro", { className: "col-span-2" })}
			{campo("cidade", "Cidade", {
				autoComplete: "address-level2",
				className: "col-span-2",
			})}
			{estado?.erro && (
				<p role="alert" className="entra col-span-2 text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<Botao
				type="submit"
				pendente={pendente}
				rotuloPendente="Salvando"
				className="col-span-2 sm:col-span-1"
			>
				Salvar dados
			</Botao>
		</form>
	);
}
