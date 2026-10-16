"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServidor } from "./supabase";

const credenciais = z.object({ email: z.email(), senha: z.string().min(1) });

export async function entrarAdmin(_: unknown, dados: FormData) {
	const entrada = credenciais.safeParse({
		email: dados.get("email"),
		senha: dados.get("senha"),
	});
	if (!entrada.success) return { erro: "Informe e-mail e senha." };
	const supabase = await supabaseServidor();
	const { error } = await supabase.auth.signInWithPassword({
		email: entrada.data.email,
		password: entrada.data.senha,
	});
	if (error) return { erro: "E-mail ou senha incorretos." };
	redirect("/admin");
}

export async function sair() {
	const supabase = await supabaseServidor();
	await supabase.auth.signOut();
	redirect("/admin/entrar");
}
