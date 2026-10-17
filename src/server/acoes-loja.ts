"use server";

import { z } from "zod";
import { calcularFrete, type Frete, limparCep } from "@/lib/frete";
import type { VarianteConferida } from "@/lib/sacola";
import { supabasePublico, urlDaFoto } from "./supabase";

const ids = z.array(z.uuid()).max(50);

export async function conferirSacola(
	entrada: string[],
): Promise<VarianteConferida[]> {
	const lista = ids.safeParse(entrada);
	if (!lista.success || !lista.data.length) return [];
	const { data, error } = await supabasePublico()
		.from("variantes")
		.select(
			"id, cor, tamanho, preco_centavos, estoque, produtos(nome, slug, produto_fotos(path_miniatura, ordem))",
		)
		.in("id", lista.data);
	if (error) throw error;
	return data.flatMap((v) => {
		if (!v.produtos) return [];
		const capa = v.produtos.produto_fotos.toSorted(
			(a, b) => a.ordem - b.ordem,
		)[0];
		return [
			{
				id: v.id,
				nome: v.produtos.nome,
				slug: v.produtos.slug,
				cor: v.cor,
				tamanho: v.tamanho,
				preco: v.preco_centavos,
				estoque: v.estoque,
				foto: capa ? urlDaFoto(capa.path_miniatura) : null,
			},
		];
	});
}

export async function freteParaCep(texto: string): Promise<Frete | null> {
	const cep = limparCep(texto);
	if (!cep) return null;
	const { data, error } = await supabasePublico()
		.from("zonas_frete")
		.select("nome, cep_inicio, cep_fim, preco_centavos");
	if (error) throw error;
	return calcularFrete(cep, data);
}
