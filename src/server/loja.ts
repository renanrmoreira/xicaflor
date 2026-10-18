import "server-only";
import { cache } from "react";
import {
	type Cartao,
	type Foto,
	type ProdutoLoja,
	padraoIlike,
	type RaizLoja,
} from "@/lib/loja";
import { ordenarVariantes } from "@/lib/tamanhos";
import { supabasePublico, urlDaFoto } from "./supabase";

type FotoBruta = {
	path_grande: string;
	path_miniatura: string;
	alt: string;
	ordem: number;
};
type VarianteBruta = {
	id: string;
	cor: string | null;
	tamanho: string | null;
	preco_centavos: number;
	estoque: number;
};

function fotos(lista: FotoBruta[]): Foto[] {
	return lista
		.toSorted((a, b) => a.ordem - b.ordem)
		.map((f) => ({
			grande: urlDaFoto(f.path_grande),
			miniatura: urlDaFoto(f.path_miniatura),
			alt: f.alt,
		}));
}

function precos(variantes: VarianteBruta[]) {
	const valores = variantes.map((v) => v.preco_centavos);
	return {
		preco: valores.length ? Math.min(...valores) : null,
		varia: new Set(valores).size > 1,
		esgotado: variantes.length > 0 && variantes.every((v) => v.estoque === 0),
	};
}

export const categoriasDaLoja = cache(async (): Promise<RaizLoja[]> => {
	if (!process.env.SUPABASE_URL) return [];
	const { data, error } = await supabasePublico()
		.from("categorias")
		.select("id, nome, slug, parent_id, vitrine, link_vitrine, ordem")
		.order("ordem")
		.order("nome");
	if (error) throw error;
	const raizes = data.filter((c) => !c.parent_id);
	return raizes.map((r) => ({
		...r,
		filhas: data.filter((c) => c.parent_id === r.id),
	}));
});

const CAMPOS_CARTAO =
	"id, nome, slug, marca, categoria_id, criado_em, variantes(id, cor, tamanho, preco_centavos, estoque), produto_fotos(path_grande, path_miniatura, alt, ordem)";

export async function produtosDaLoja(
	filtro: {
		categorias?: string[];
		destaque?: boolean;
		limite?: number;
		busca?: string;
	} = {},
): Promise<Cartao[]> {
	if (!process.env.SUPABASE_URL) return [];
	let consulta = supabasePublico()
		.from("produtos")
		.select(CAMPOS_CARTAO)
		.order("criado_em", { ascending: false });
	if (filtro.categorias)
		consulta = consulta.in("categoria_id", filtro.categorias);
	if (filtro.destaque) consulta = consulta.eq("destaque", true);
	if (filtro.busca)
		consulta = consulta.ilike("nome", padraoIlike(filtro.busca));
	if (filtro.limite) consulta = consulta.limit(filtro.limite);
	const [raizes, { data, error }] = await Promise.all([
		categoriasDaLoja(),
		consulta,
	]);
	if (error) throw error;
	const vitrine = new Set(
		raizes
			.filter((r) => r.vitrine)
			.flatMap((r) => [r.id, ...r.filhas.map((f) => f.id)]),
	);
	const visiveis = new Set(
		raizes.flatMap((r) => [r.id, ...r.filhas.map((f) => f.id)]),
	);
	return data
		.filter((p) => visiveis.has(p.categoria_id))
		.map((p) => ({
			id: p.id,
			nome: p.nome,
			slug: p.slug,
			marca: p.marca,
			capa: fotos(p.produto_fotos)[0] ?? null,
			vitrine: vitrine.has(p.categoria_id),
			...precos(p.variantes),
		}));
}

export async function categoriaPorSlug(slug: string) {
	const raizes = await categoriasDaLoja();
	for (const raiz of raizes) {
		if (raiz.slug === slug)
			return {
				raiz,
				atual: raiz,
				ids: [raiz.id, ...raiz.filhas.map((f) => f.id)],
			};
		const filha = raiz.filhas.find((f) => f.slug === slug);
		if (filha) return { raiz, atual: filha, ids: [filha.id] };
	}
	return null;
}

export const produtoPorSlug = cache(
	async (slug: string): Promise<ProdutoLoja | null> => {
		const { data, error } = await supabasePublico()
			.from("produtos")
			.select(`${CAMPOS_CARTAO}, descricao`)
			.eq("slug", slug)
			.maybeSingle();
		if (error) throw error;
		if (!data) return null;
		const raizes = await categoriasDaLoja();
		const raiz = raizes.find(
			(r) =>
				r.id === data.categoria_id ||
				r.filhas.some((f) => f.id === data.categoria_id),
		);
		if (!raiz) return null;
		const categoria =
			raiz.filhas.find((f) => f.id === data.categoria_id) ?? raiz;
		return {
			id: data.id,
			nome: data.nome,
			slug: data.slug,
			marca: data.marca,
			descricao: data.descricao,
			fotos: fotos(data.produto_fotos),
			variantes: ordenarVariantes(data.variantes),
			vitrine: raiz.vitrine,
			linkVitrine: raiz.link_vitrine,
			categoria: { nome: categoria.nome, slug: categoria.slug },
			...precos(data.variantes),
		};
	},
);

export async function slugsDaLoja() {
	if (!process.env.SUPABASE_URL) return [];
	const { data, error } = await supabasePublico()
		.from("produtos")
		.select("slug");
	if (error) throw error;
	return data;
}
