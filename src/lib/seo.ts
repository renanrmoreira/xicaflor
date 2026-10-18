import { type ProdutoLoja, SITE } from "./loja";

export function jsonLdProduto(produto: ProdutoLoja) {
	const precos = produto.variantes.map((v) => v.preco_centavos / 100);
	const disponivel = produto.variantes.some((v) => v.estoque > 0);
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: produto.nome,
		description: produto.descricao || undefined,
		image: produto.fotos.map((f) => f.grande),
		brand: produto.marca
			? { "@type": "Brand", name: produto.marca }
			: undefined,
		offers: precos.length
			? {
					"@type": "AggregateOffer",
					priceCurrency: "BRL",
					lowPrice: Math.min(...precos),
					highPrice: Math.max(...precos),
					offerCount: precos.length,
					availability: `https://schema.org/${disponivel ? "InStock" : "OutOfStock"}`,
					url: `${SITE}/p/${produto.slug}`,
				}
			: undefined,
	};
}

export const scriptJsonLd = (dados: object) =>
	JSON.stringify(dados).replaceAll("<", "\\u003c");

export const OG_BASE = {
	siteName: "Xica Flor",
	locale: "pt_BR",
	type: "website" as const,
	images: [{ url: "/icone-512.png", width: 512, height: 512 }],
};
