"use client";

import { useActionState } from "react";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import type { AcaoConta } from "@/lib/resultado";
import { Captcha } from "./captcha";

export function FormEntrar({
	acao,
	captcha,
}: {
	acao: AcaoConta;
	captcha?: string;
}) {
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
			<Captcha chave={captcha} renovar={estado} />
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

export function FormCadastro({
	acao,
	captcha,
}: {
	acao: AcaoConta;
	captcha?: string;
}) {
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
			<Captcha chave={captcha} renovar={estado} />
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

export function FormLink({
	acao,
	captcha,
}: {
	acao: AcaoConta;
	captcha?: string;
}) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	if (estado?.ok)
		return (
			<p role="status" className="entra bg-amarelo p-4 text-bordo">
				Se houver uma conta com esse e-mail, enviamos o link. Confira também a
				caixa de spam.
			</p>
		);
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
			<Captcha chave={captcha} renovar={estado} />
			{estado?.erro && (
				<p role="alert" className="entra text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<div className="flex flex-wrap gap-3">
				<Botao
					type="submit"
					name="acao"
					value="entrar"
					variante="secundario"
					pendente={pendente}
					rotuloPendente="Enviando"
				>
					Receber link para entrar
				</Botao>
				<Botao
					type="submit"
					name="acao"
					value="senha"
					variante="fantasma"
					disabled={pendente}
				>
					Esqueci minha senha
				</Botao>
			</div>
		</form>
	);
}

export function FormNovaSenha({ acao }: { acao: AcaoConta }) {
	const [estado, enviar, pendente] = useActionState(acao, undefined);
	return (
		<form action={enviar} className="flex max-w-md flex-col gap-4">
			<Campo
				rotulo="Nova senha (mínimo 8 caracteres)"
				name="senha"
				type="password"
				autoComplete="new-password"
				required
			/>
			{estado?.erro && (
				<p role="alert" className="entra text-small text-vermelho">
					{estado.erro}
				</p>
			)}
			<Botao type="submit" pendente={pendente} rotuloPendente="Salvando">
				Salvar nova senha
			</Botao>
		</form>
	);
}
