const WHATSAPP = "5591988008817";
export const INSTAGRAM = "xicaflor_";
export const SITE = "https://xicaflor.renanrodrigues2292.workers.dev";
export const SLOGAN = "Seja você o seu próprio padrão de beleza!";

export function linkWhatsapp(mensagem: string) {
	return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

export type Foto = { grande: string; miniatura: string; alt: string };

export type Cartao = {
	id: string;
	nome: string;
	slug: string;
	marca: string | null;
	capa: Foto | null;
	vitrine: boolean;
	preco: number | null;
	varia: boolean;
	esgotado: boolean;
};

export type VarianteLoja = {
	id: string;
	cor: string | null;
	tamanho: string | null;
	preco_centavos: number;
	estoque: number;
};

export type ProdutoLoja = Omit<Cartao, "capa"> & {
	descricao: string;
	fotos: Foto[];
	variantes: VarianteLoja[];
	linkVitrine: string | null;
	categoria: { nome: string; slug: string };
};

type CategoriaLoja = { id: string; nome: string; slug: string };
export type RaizLoja = CategoriaLoja & {
	vitrine: boolean;
	link_vitrine: string | null;
	filhas: CategoriaLoja[];
};

export function termoDeBusca(
	texto: string | string[] | undefined,
): string | null {
	const termo =
		(Array.isArray(texto) ? texto[0] : texto)
			?.trim()
			.replace(/\s+/g, " ")
			.slice(0, 60) ?? "";
	return termo.length >= 2 ? termo : null;
}

export function padraoIlike(termo: string): string {
	return `%${termo.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
