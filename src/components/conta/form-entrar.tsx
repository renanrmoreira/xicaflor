"use client";

import { useActionState } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import type { EstadoConta } from "@/lib/resultado";

type Acao = (estado: EstadoConta, dados: FormData) => Promise<EstadoConta>;

export function FormEntrar({ acao }: { acao: Acao }) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	return (
		<form action={enviar} className="flex flex-col gap-4">
			<Campo
				rotulo="E-mail"
				name="email"
				type="email"
				autoComplete="email"
				defaultValue={estado?.valores?.email}
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

export function FormCadastro({ acao }: { acao: Acao }) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	const v = estado?.valores;
	if (estado?.ok)
		return (
			<p role="status" className="entra bg-amarelo p-4 text-bordo">
				Conta criada! Enviamos um e-mail para confirmar o endereço. Depois é só
				entrar.
			</p>
		);
	return (
		<form action={enviar} className="flex flex-col gap-4">
			<Campo
				rotulo="Nome"
				name="nome"
				autoComplete="name"
				defaultValue={v?.nome}
				required
			/>
			<Campo
				rotulo="E-mail"
				name="email"
				type="email"
				autoComplete="email"
				defaultValue={v?.email}
				required
			/>
			<Campo
				rotulo="WhatsApp (opcional)"
				name="telefone"
				type="tel"
				inputMode="tel"
				autoComplete="tel"
				placeholder="(91) 90000-0000"
				defaultValue={v?.telefone}
			/>
			<Campo
				rotulo="Senha (mínimo 8 caracteres)"
				name="senha"
				type="password"
				autoComplete="new-password"
				required
				minLength={8}
			/>
			{estado?.erro && (
				<p role="alert" className="entra text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<Botao type="submit" pendente={pendente} rotuloPendente="Criando conta">
				Criar conta
			</Botao>
		</form>
	);
}
