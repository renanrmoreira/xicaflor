import "server-only";
import { ordenarVariantes } from "@/lib/tamanhos";
import { supabaseServidor, urlDaFoto } from "./supabase";

export type Categoria = {
	id: string;
	nome: string;
	slug: string;
	ordem: number;
	ativo: boolean;
	link_vitrine: string | null;
	vitrine: boolean;
	filhas: Categoria[];
};

export async function arvoreDeCategorias(): Promise<Categoria[]> {
	const supabase = await supabaseServidor();
	const { data, error } = await supabase
		.from("categorias")
		.select("id, nome, slug, ordem, ativo, link_vitrine, vitrine, parent_id")
		.order("ordem")
		.order("nome");
	if (error) throw error;
	const raizes = data
		.filter((c) => !c.parent_id)
		.map((c) => ({ ...c, filhas: [] as Categoria[] }));
	for (const c of data)
		raizes.find((r) => r.id === c.parent_id)?.filhas.push({ ...c, filhas: [] });
	return raizes;
}

export async function produtosDoAdmin() {
	const supabase = await supabaseServidor();
	const { data, error } = await supabase
		.from("produtos")
		.select(
			"id, nome, ativo, categorias(nome), variantes(id, cor, tamanho, estoque, preco_centavos, ativo), produto_fotos(path_miniatura, ordem)",
		)
		.order("criado_em", { ascending: false });
	if (error) throw error;
	return data.map(({ produto_fotos, ...p }) => {
		const capa = produto_fotos.toSorted((a, b) => a.ordem - b.ordem)[0];
		return {
			...p,
			capa: capa ? urlDaFoto(capa.path_miniatura) : null,
			variantes: ordenarVariantes(p.variantes.filter((v) => v.ativo)),
		};
	});
}

export async function produtoParaEdicao(id: string) {
	const supabase = await supabaseServidor();
	const { data } = await supabase
		.from("produtos")
		.select(
			"id, nome, descricao, marca, categoria_id, ativo, destaque, variantes(id, cor, tamanho, estoque, preco_centavos, ativo)",
		)
		.eq("id", id)
		.maybeSingle();
	return (
		data && {
			...data,
			variantes: ordenarVariantes(data.variantes.filter((v) => v.ativo)),
		}
	);
}

export async function fotosDoProduto(produtoId: string) {
	const supabase = await supabaseServidor();
	const { data, error } = await supabase
		.from("produto_fotos")
		.select("id, alt, path_miniatura")
		.eq("produto_id", produtoId)
		.order("ordem");
	if (error) throw error;
	return data.map((f) => ({
		id: f.id,
		alt: f.alt,
		url: urlDaFoto(f.path_miniatura),
	}));
}
