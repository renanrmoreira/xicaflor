"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { log } from "@/lib/log";
import { type ProdutoEntrada, produtoValido } from "@/lib/produto";
import { slug } from "@/lib/slug";
import { exigirAdmin } from "./auth";
import { supabaseServidor } from "./supabase";

export async function salvarProduto(
	entrada: ProdutoEntrada,
): Promise<{ erro: string }> {
	await exigirAdmin();
	const produto = produtoValido.safeParse(entrada);
	if (!produto.success) return { erro: produto.error.issues[0].message };
	const { variantes, ...dados } = produto.data;
	const supabase = await supabaseServidor();
	const { data: id, error } = await supabase.rpc("salvar_produto", {
		dados: {
			...dados,
			slug: slug(dados.nome),
			variantes: variantes.map(({ preco, ...v }) => ({
				...v,
				preco_centavos: preco,
			})),
		},
	});
	if (error) {
		if (error.code === "23514")
			return {
				erro: "Produto de Beleza (vitrine) não tem variantes; os demais precisam de ao menos uma.",
			};
		log("error", "salvar produto", { erro: error.message });
		return { erro: "Não foi possível salvar. Tente de novo." };
	}
	revalidatePath("/", "layout");
	redirect(dados.id ? "/admin/produtos" : `/admin/produtos/${id}#fotos`);
}

export async function alternarProduto(id: string, ativo: boolean) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { error } = await supabase
		.from("produtos")
		.update({ ativo })
		.eq("id", z.uuid().parse(id));
	if (error) log("error", "alternar produto", { erro: error.message });
	revalidatePath("/", "layout");
}

export async function ajustarEstoque(varianteId: string, delta: 1 | -1) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { error } = await supabase.rpc("ajustar_estoque", {
		variante: z.uuid().parse(varianteId),
		delta,
	});
	if (error && error.code !== "23514")
		log("error", "ajustar estoque", { erro: error.message });
	revalidatePath("/", "layout");
}
