"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoConta } from "@/lib/resultado";
import { supabaseServidor } from "./supabase";

const credenciais = z.object({ email: z.email(), senha: z.string().min(1) });

const cadastro = z.object({
	nome: z.string().trim().min(2, "Informe seu nome.").max(80),
	email: z.email("E-mail inválido."),
	telefone: z
		.string()
		.transform((t) => t.replace(/\D/g, ""))
		.refine(
			(t) => t === "" || (t.length >= 10 && t.length <= 13),
			"WhatsApp com DDD, só números.",
		),
	senha: z
		.string()
		.min(8, "A senha precisa de pelo menos 8 caracteres.")
		.max(72),
});

const destinos = ["/admin", "/conta"] as const;

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
	const valores = {
		nome: String(dados.get("nome") ?? ""),
		email: String(dados.get("email") ?? ""),
		telefone: String(dados.get("telefone") ?? ""),
	};
	const entrada = cadastro.safeParse({ ...valores, senha: dados.get("senha") });
	if (!entrada.success)
		return { erro: entrada.error.issues[0].message, valores };
	const supabase = await supabaseServidor();
	const { data, error } = await supabase.auth.signUp({
		email: entrada.data.email,
		password: entrada.data.senha,
		options: { data: { nome: entrada.data.nome } },
	});
	if (error)
		return {
			erro:
				error.code === "user_already_exists"
					? "Já existe uma conta com esse e-mail."
					: "Não foi possível criar a conta.",
			valores,
		};
	if (!data.session) return { ok: true };
	if (entrada.data.telefone)
		await supabase
			.from("perfis")
			.update({ telefone: entrada.data.telefone })
			.eq("id", data.session.user.id);
	redirect("/conta");
}

export async function sair(destino: "/admin/entrar" | "/entrar") {
	const supabase = await supabaseServidor();
	await supabase.auth.signOut();
	redirect(destino === "/admin/entrar" ? destino : "/entrar");
}
