import type { MetadataRoute } from "next";
import { SITE } from "@/lib/loja";
import { categoriasDaLoja, slugsDaLoja } from "@/server/loja";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [raizes, produtos] = await Promise.all([
		categoriasDaLoja(),
		slugsDaLoja(),
	]);
	const categorias = raizes.flatMap((r) => [r, ...r.filhas]);
	const ativas = new Set(categorias.map((c) => c.id));
	return [
		{ url: SITE, changeFrequency: "daily", priority: 1 },
		...["sobre", "contato", "trocas", "privacidade"].map((p) => ({
			url: `${SITE}/${p}`,
		})),
		...categorias.map((c) => ({
			url: `${SITE}/c/${c.slug}`,
			changeFrequency: "daily" as const,
		})),
		...produtos
			.filter((p) => ativas.has(p.categoria_id))
			.map((p) => ({ url: `${SITE}/p/${p.slug}` })),
	];
}
