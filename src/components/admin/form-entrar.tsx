"use client";

import { useActionState } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";

type Estado = { erro?: string } | undefined;

export function FormEntrar({
	acao,
}: {
	acao: (estado: Estado, dados: FormData) => Promise<Estado>;
}) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	return (
		<form action={enviar} className="flex flex-col gap-4">
			<Campo
				rotulo="E-mail"
				name="email"
				type="email"
				autoComplete="email"
				required
			/>
			<Campo
				rotulo="Senha"
				name="senha"
				type="password"
				autoComplete="current-password"
				required
			/>
			{estado?.erro && (
				<p role="alert" className="entra text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<Botao type="submit" pendente={pendente} rotuloPendente="Entrando">
				Entrar
			</Botao>
		</form>
	);
}
