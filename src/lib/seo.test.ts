import { expect, it } from "vitest";
import type { ProdutoLoja } from "./loja";
import { jsonLdProduto, scriptJsonLd } from "./seo";

const produto = {
	nome: "Vestido Ipê",
	slug: "vestido-ipe",
	marca: null,
	descricao: "",
	fotos: [{ grande: "g.webp", miniatura: "m.webp", alt: "" }],
	variantes: [
		{ id: "1", cor: null, tamanho: "P", preco_centavos: 18990, estoque: 0 },
		{ id: "2", cor: null, tamanho: "M", preco_centavos: 19990, estoque: 2 },
	],
} as unknown as ProdutoLoja;

it("monta o Product com faixa de preço em reais e disponibilidade", () => {
	expect(jsonLdProduto(produto).offers).toMatchObject({
		priceCurrency: "BRL",
		lowPrice: 189.9,
		highPrice: 199.9,
		availability: "https://schema.org/InStock",
	});
});

it("escapa < para não fechar a tag script", () => {
	expect(scriptJsonLd({ nome: "</script>" })).not.toContain("<");
});
