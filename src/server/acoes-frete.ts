"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { centavosDeTexto } from "@/lib/dinheiro";
import { limparCep } from "@/lib/frete";
import { log } from "@/lib/log";
import { exigirAdmin } from "./auth";
import { supabaseServidor } from "./supabase";

export type Resultado = { erro?: string; ok?: boolean } | undefined;

const cep = z
	.string()
	.transform((t) => limparCep(t))
	.refine((c): c is string => c !== null, "CEP com 8 números.");

const zonaValida = z
	.object({
		nome: z.string().trim().min(2, "Nome com pelo menos 2 letras.").max(40),
		cep_inicio: cep,
		cep_fim: cep,
		preco_centavos: z
			.string()
			.trim()
			.transform((t) => (t ? (centavosDeTexto(t) ?? -1) : null))
			.refine(
				(c) => c === null || c >= 0,
				"Preço inválido. Use 15,00, ou deixe vazio para frete a combinar.",
			),
	})
	.refine((z) => z.cep_inicio <= z.cep_fim, {
		message: "O CEP inicial deve vir antes do final.",
	});

export async function salvarZona(
	id: string | null,
	_: Resultado,
	dados: FormData,
): Promise<Resultado> {
	await exigirAdmin();
	const zona = zonaValida.safeParse(Object.fromEntries(dados));
	if (!zona.success) return { erro: zona.error.issues[0].message };
	const supabase = await supabaseServidor();
	const { error } = id
		? await supabase
				.from("zonas_frete")
				.update(zona.data)
				.eq("id", z.uuid().parse(id))
		: await supabase.from("zonas_frete").insert(zona.data);
	if (error) {
		log("error", "salvar zona de frete", { erro: error.message });
		return { erro: "Não foi possível salvar. Tente de novo." };
	}
	revalidatePath("/admin/frete");
	return { ok: true };
}

export async function alternarZona(id: string, ativo: boolean) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("zonas_frete")
		.update({ ativo })
		.eq("id", z.uuid().parse(id));
	if (error) log("error", "alternar zona de frete", { erro: error.message });
	revalidatePath("/admin/frete");
}
