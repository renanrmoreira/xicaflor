import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compra } from "@/components/loja/compra";
import { Galeria } from "@/components/loja/galeria";
import { classeBotao } from "@/components/ui/botao";
import { linkWhatsapp } from "@/lib/loja";
import { jsonLdProduto, OG_BASE, scriptJsonLd } from "@/lib/seo";
import { produtoPorSlug } from "@/server/loja";

export const revalidate = 3600;

export function generateStaticParams() {
	return [];
}

export async function generateMetadata({
	params,
}: PageProps<"/p/[slug]">): Promise<Metadata> {
	const produto = await produtoPorSlug((await params).slug);
	if (!produto) return {};
	const titulo = `${produto.nome} — Xica Flor`;
	const descricao =
		produto.descricao.slice(0, 160) ||
		`${produto.nome} na Xica Flor, moda feminina em Belém.`;
	return {
		title: titulo,
		description: descricao,
		alternates: { canonical: `/p/${produto.slug}` },
		openGraph: {
			...OG_BASE,
			title: titulo,
			description: descricao,
			images: produto.fotos[0]
				? [{ url: produto.fotos[0].grande, width: 1280, height: 1600 }]
				: OG_BASE.images,
		},
	};
}

export default async function Page({ params }: PageProps<"/p/[slug]">) {
	const produto = await produtoPorSlug((await params).slug);
	if (!produto) notFound();

	return (
		<article className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-12 md:px-(--margem) md:pt-8">
			{!produto.vitrine && produto.variantes.length > 0 && (
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD com < escapado em scriptJsonLd
					dangerouslySetInnerHTML={{
						__html: scriptJsonLd(jsonLdProduto(produto)),
					}}
				/>
			)}
			<Galeria fotos={produto.fotos} nome={produto.nome} />
			<div className="flex flex-col gap-6 px-(--margem) md:sticky md:top-24 md:self-start md:px-0">
				<div className="flex flex-col gap-2">
					<Link
						href={`/c/${produto.categoria.slug}`}
						className="text-small text-suave underline-offset-4 hover:underline"
					>
						{produto.categoria.nome}
					</Link>
					{produto.marca && (
						<p className="text-small font-semibold">{produto.marca}</p>
					)}
					<h1 className="display text-[clamp(2.5rem,8vw,4.5rem)]">
						{produto.nome}
					</h1>
				</div>

				{produto.vitrine ? (
					<div className="flex flex-col gap-3">
						{produto.linkVitrine ? (
							<a
								href={produto.linkVitrine}
								target="_blank"
								rel="sponsored noopener"
								className={classeBotao()}
							>
								Comprar na loja
							</a>
						) : (
							<a
								href={linkWhatsapp(`Olá! Tenho interesse em ${produto.nome}.`)}
								target="_blank"
								rel="noopener"
								className={classeBotao()}
							>
								Pedir pelo WhatsApp
							</a>
						)}
						<p className="text-small text-suave">
							A compra é finalizada na loja oficial da marca, com preço e
							entrega dela.
						</p>
					</div>
				) : produto.variantes.length ? (
					<Compra variantes={produto.variantes} />
				) : (
					<p className="text-suave">Indisponível no momento.</p>
				)}

				{produto.descricao && (
					<div className="border-t border-linha pt-6">
						<h2 className="mb-2 text-small font-semibold">Detalhes</h2>
						<p className="whitespace-pre-line text-suave">
							{produto.descricao}
						</p>
					</div>
				)}
			</div>
		</article>
	);
}
