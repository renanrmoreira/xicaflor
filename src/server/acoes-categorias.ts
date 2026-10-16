"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { log } from "@/lib/log";
import { slug } from "@/lib/slug";
import { exigirAdmin } from "./auth";
import { supabaseServidor } from "./supabase";

export type Resultado = { erro?: string; ok?: boolean } | undefined;

const nomeValido = z
	.string()
	.trim()
	.min(2, "Use pelo menos 2 letras.")
	.max(40, "Use até 40 letras.");
const idValido = z.uuid();

function falha(
	erro: { code?: string; message: string },
	contexto: string,
): Resultado {
	if (erro.code === "23505")
		return { erro: "Já existe uma categoria com esse nome." };
	log("error", contexto, { erro: erro.message });
	return { erro: "Não foi possível salvar. Tente de novo." };
}

function pronto(): Resultado {
	revalidatePath("/", "layout");
	return { ok: true };
}

export async function criarCategoria(
	paiId: string,
	_: Resultado,
	dados: FormData,
): Promise<Resultado> {
	await exigirAdmin();
	const nome = nomeValido.safeParse(dados.get("nome"));
	if (!nome.success || !idValido.safeParse(paiId).success)
		return { erro: nome.error?.issues[0].message };
	const supabase = await supabaseServidor();
	const { count } = await supabase
		.from("categorias")
		.select("id", { count: "exact", head: true })
		.eq("parent_id", paiId);
	const { error } = await supabase.from("categorias").insert({
		nome: nome.data,
		slug: slug(nome.data),
		parent_id: paiId,
		ordem: count ?? 0,
	});
	return error ? falha(error, "criar categoria") : pronto();
}

export async function renomearCategoria(
	id: string,
	_: Resultado,
	dados: FormData,
): Promise<Resultado> {
	await exigirAdmin();
	const nome = nomeValido.safeParse(dados.get("nome"));
	if (!nome.success) return { erro: nome.error.issues[0].message };
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("categorias")
		.update({ nome: nome.data, slug: slug(nome.data) })
		.eq("id", idValido.parse(id));
	return error ? falha(error, "renomear categoria") : pronto();
}

export async function alternarCategoria(id: string, ativo: boolean) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("categorias")
		.update({ ativo })
		.eq("id", idValido.parse(id));
	if (error) log("error", "alternar categoria", { erro: error.message });
	revalidatePath("/", "layout");
}

// ponytail: troca de ordem em dois updates sem transação; basta para dois admins, migrar para função SQL se houver concorrência
export async function moverCategoria(id: string, direcao: -1 | 1) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { data: atual } = await supabase
		.from("categorias")
		.select("parent_id")
		.eq("id", idValido.parse(id))
		.single();
	if (!atual?.parent_id) return;
	const { data: irmas } = await supabase
		.from("categorias")
		.select("id")
		.eq("parent_id", atual.parent_id)
		.order("ordem")
		.order("nome");
	const lista = irmas?.map((c) => c.id) ?? [];
	const i = lista.indexOf(id);
	const j = i + direcao;
	if (i < 0 || j < 0 || j >= lista.length) return;
	[lista[i], lista[j]] = [lista[j], lista[i]];
	await Promise.all(
		lista.map((cid, ordem) =>
			supabase.from("categorias").update({ ordem }).eq("id", cid),
		),
	);
	revalidatePath("/", "layout");
}

const linkValido = z.union([
	z.literal(""),
	z.url({
		protocol: /^https$/,
		error: "Use um link completo começando com https://",
	}),
]);

export async function salvarLinkVitrine(
	id: string,
	_: Resultado,
	dados: FormData,
): Promise<Resultado> {
	await exigirAdmin();
	const link = linkValido.safeParse(String(dados.get("link") ?? "").trim());
	if (!link.success) return { erro: link.error.issues[0].message };
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("categorias")
		.update({ link_vitrine: link.data || null })
		.eq("id", idValido.parse(id))
		.is("parent_id", null);
	return error ? falha(error, "salvar link da vitrine") : pronto();
}
