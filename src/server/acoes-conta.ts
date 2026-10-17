"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { limparCep } from "@/lib/frete";
import { log } from "@/lib/log";
import type { EstadoConta } from "@/lib/resultado";
import { nome, telefone, valoresDoForm } from "@/lib/validacao";
import { exigirCliente } from "./cliente";
import { supabaseServidor } from "./supabase";

const opcional = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((t) => t || null);

const perfil = z.object({
	nome,
	telefone: telefone.transform((t) => t || null),
	cep: z
		.string()
		.transform((t) => (t.trim() ? limparCep(t) : ""))
		.refine((c): c is string => c !== null, "CEP com 8 números.")
		.transform((c) => c || null),
	logradouro: opcional(120),
	numero: opcional(20),
	complemento: opcional(80),
	bairro: opcional(80),
	cidade: opcional(80),
	uf: z
		.string()
		.trim()
		.toUpperCase()
		.refine((u) => u === "" || /^[A-Z]{2}$/.test(u), "UF com 2 letras.")
		.transform((u) => u || null),
});

export async function salvarPerfil(
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	const { id } = await exigirCliente();
	const valores = valoresDoForm(dados, perfil.keyof().options);
	const entrada = perfil.safeParse(valores);
	if (!entrada.success)
		return { erro: entrada.error.issues[0].message, valores };
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("perfis")
		.update(entrada.data)
		.eq("id", id);
	if (error) {
		log("error", "salvar perfil", { erro: error.message });
		return { erro: "Não foi possível salvar. Tente de novo.", valores };
	}
	revalidatePath("/conta");
	return { ok: true, valores };
}
