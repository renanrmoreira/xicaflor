const WHATSAPP = "5591988008817";
export const INSTAGRAM = "xicaflor_";
export const TELEFONE = "(91) 98800-8817";
export const CNPJ = "48.021.886/0001-86";
export const ENDERECO = "Rua dos Caripunas, 2742 – Belém/PA";
export const HORARIO = "das 8h às 12h e das 14h às 18h";
export const LINK_INSTAGRAM = `https://instagram.com/${INSTAGRAM}`;
export const SITE = "https://xicaflor.com.br";
export const AMARELO = "#F8E154";
export const SLOGAN = "Seja você o seu próprio padrão de beleza!";

export const whatsappDoCliente = (telefone: string | null) =>
	telefone && telefone.length <= 11 ? `55${telefone}` : telefone;

export function linkWhatsapp(mensagem: string, numero = WHATSAPP) {
	return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
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
