"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoConta } from "@/lib/resultado";
import { nome, telefone, valoresDoForm } from "@/lib/validacao";
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
	});
	if (error) return { erro: "E-mail ou senha incorretos.", valores: { email } };
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
		},
	});
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
