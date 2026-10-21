"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoConta } from "@/lib/resultado";
import { nome, telefone, valoresDoForm } from "@/lib/validacao";
import { exigirRecuperacao, RECUPERACAO } from "./cliente";
import { supabaseServidor } from "./supabase";

const credenciais = z.object({ email: z.email(), senha: z.string().min(1) });

const cadastro = z.object({
	nome,
	email: z.email("E-mail inválido."),
	telefone,
	senha: z
		.string()
		.min(8, "A senha precisa de pelo menos 8 caracteres.")
		.max(72),
});

const captcha = (dados: FormData) =>
	String(dados.get("cf-turnstile-response") ?? "") || undefined;

const ERRO_CAPTCHA = "Confirme a verificação de segurança e tente de novo.";

const destinos = ["/admin", "/conta", "/checkout"] as const;

export async function entrar(
	destino: (typeof destinos)[number],
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	const email = String(dados.get("email") ?? "");
	const entrada = credenciais.safeParse({ email, senha: dados.get("senha") });
	if (!entrada.success)
		return { erro: "Informe e-mail e senha.", valores: { email } };
	const supabase = await supabaseServidor();
	const { error } = await supabase.auth.signInWithPassword({
		email: entrada.data.email,
		password: entrada.data.senha,
		options: { captchaToken: captcha(dados) },
	});
	if (error)
		return {
			erro:
				error.code === "captcha_failed"
					? ERRO_CAPTCHA
					: "E-mail ou senha incorretos.",
			valores: { email },
		};
	redirect(destinos.includes(destino) ? destino : "/conta");
}

export async function criarConta(
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	const valores = valoresDoForm(dados, ["nome", "email", "telefone"]);
	const entrada = cadastro.safeParse({ ...valores, senha: dados.get("senha") });
	if (!entrada.success)
		return { erro: entrada.error.issues[0].message, valores };
	const supabase = await supabaseServidor();
	const { data, error } = await supabase.auth.signUp({
		email: entrada.data.email,
		password: entrada.data.senha,
		options: {
			data: { nome: entrada.data.nome, telefone: entrada.data.telefone },
			captchaToken: captcha(dados),
		},
	});
	if (error?.code === "captcha_failed") return { erro: ERRO_CAPTCHA, valores };
	if (error)
		return {
			erro: "Não foi possível criar a conta. Se você já tem conta, use Entrar.",
			valores,
		};
	if (!data.session) return { ok: true };
	redirect("/conta");
}

export async function sair(destino: "/admin/entrar" | "/entrar") {
	const supabase = await supabaseServidor();
	await supabase.auth.signOut();
	redirect(destino === "/admin/entrar" ? destino : "/entrar");
}

export async function pedirLink(
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	const email = String(dados.get("email") ?? "");
	const entrada = z.email().safeParse(email);
	if (!entrada.success) return { erro: "E-mail inválido.", valores: { email } };
	const supabase = await supabaseServidor();
	const { error } =
		dados.get("acao") === "senha"
			? await supabase.auth.resetPasswordForEmail(entrada.data, {
					captchaToken: captcha(dados),
				})
			: await supabase.auth.signInWithOtp({
					email: entrada.data,
					options: { shouldCreateUser: false, captchaToken: captcha(dados) },
				});
	// Erros 4xx (conta inexistente, limite de envio) respondem igual ao sucesso para não revelar quem tem conta.
	if (error?.code === "captcha_failed")
		return { erro: ERRO_CAPTCHA, valores: { email } };
	if (error && (error.status ?? 500) >= 500)
		return {
			erro: "Não foi possível enviar agora. Tente de novo em instantes.",
			valores: { email },
		};
	return { ok: true };
}

const novaSenha = cadastro.shape.senha;

export async function trocarSenha(
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	await exigirRecuperacao();
	const senha = novaSenha.safeParse(dados.get("senha"));
	if (!senha.success) return { erro: senha.error.issues[0].message };
	const supabase = await supabaseServidor();
	const { error } = await supabase.auth.updateUser({ password: senha.data });
	if (error)
		return {
			erro:
				error.code === "same_password"
					? "Escolha uma senha diferente da atual."
					: error.code === "weak_password"
						? "Senha fraca. Use uma senha mais longa."
						: "Não foi possível trocar a senha. Peça um novo link.",
		};
	(await cookies()).delete(RECUPERACAO);
	await supabase.auth.signOut({ scope: "others" });
	redirect("/conta");
}
