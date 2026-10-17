"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { limparCep } from "@/lib/frete";
import { log } from "@/lib/log";
import type { EstadoConta } from "@/lib/resultado";
import { exigirCliente } from "./cliente";
import { supabaseServidor } from "./supabase";

const texto = (max: number) => z.string().trim().max(max);

const perfil = z.object({
	nome: z.string().trim().min(2, "Informe seu nome.").max(80),
	telefone: z
		.string()
		.transform((t) => t.replace(/\D/g, ""))
		.refine(
			(t) => t === "" || (t.length >= 10 && t.length <= 13),
			"WhatsApp com DDD, só números.",
		),
	cep: z
		.string()
		.transform((t) => (t.trim() ? limparCep(t) : ""))
		.refine((c): c is string => c !== null, "CEP com 8 números."),
	logradouro: texto(120),
	numero: texto(20),
	complemento: texto(80),
	bairro: texto(80),
	cidade: texto(80),
	uf: z
		.string()
		.trim()
		.toUpperCase()
		.refine((u) => u === "" || /^[A-Z]{2}$/.test(u), "UF com 2 letras."),
});

export async function salvarPerfil(
	_: EstadoConta,
	dados: FormData,
): Promise<EstadoConta> {
	const { id } = await exigirCliente();
	const valores = Object.fromEntries(
		[...dados].map(([k, v]) => [k, String(v)]),
	);
	const entrada = perfil.safeParse(valores);
	if (!entrada.success)
		return { erro: entrada.error.issues[0].message, valores };
	const vazioViraNulo = Object.fromEntries(
		Object.entries(entrada.data).map(([k, v]) => [k, v || null]),
	);
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("perfis")
		.update({ ...vazioViraNulo, nome: entrada.data.nome })
		.eq("id", id);
	if (error) {
		log("error", "salvar perfil", { erro: error.message });
		return { erro: "Não foi possível salvar. Tente de novo.", valores };
	}
	revalidatePath("/conta");
	return { ok: true, valores };
}
