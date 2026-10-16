import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compra } from "@/components/loja/compra";
import { Galeria } from "@/components/loja/galeria";
import { linkWhatsapp } from "@/lib/loja";
import { produtoPorSlug } from "@/server/loja";

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
			title: titulo,
			description: descricao,
			type: "website",
			images: produto.fotos[0]
				? [{ url: produto.fotos[0].grande, width: 1280, height: 1600 }]
				: undefined,
		},
	};
}

export default async function Page({ params }: PageProps<"/p/[slug]">) {
	const produto = await produtoPorSlug((await params).slug);
	if (!produto) notFound();
	const host = (await headers()).get("host");
	const url = `https://${host}/p/${produto.slug}`;

	return (
		<article className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-12 md:px-(--margem) md:pt-8">
			<Galeria fotos={produto.fotos} nome={produto.nome} />
			<div className="flex flex-col gap-6 px-(--margem) md:sticky md:top-24 md:self-start md:px-0">
				<div className="entra flex flex-col gap-2">
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
								className="botao bg-vermelho text-papel hover:bg-bordo"
							>
								Comprar na loja
							</a>
						) : (
							<a
								href={linkWhatsapp(`Olá! Tenho interesse em ${produto.nome}.`)}
								target="_blank"
								rel="noopener"
								className="botao bg-vermelho text-papel hover:bg-bordo"
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
					<Compra nome={produto.nome} url={url} variantes={produto.variantes} />
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
