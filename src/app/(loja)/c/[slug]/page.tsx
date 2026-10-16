import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeProdutos } from "@/components/loja/cartao-produto";
import { categoriaPorSlug, produtosDaLoja } from "@/server/loja";

export async function generateMetadata({
	params,
}: PageProps<"/c/[slug]">): Promise<Metadata> {
	const categoria = await categoriaPorSlug((await params).slug);
	if (!categoria) return {};
	const titulo = `${categoria.atual.nome} — Xica Flor`;
	return {
		title: titulo,
		openGraph: { title: titulo },
		alternates: { canonical: `/c/${categoria.atual.slug}` },
	};
}

export default async function Page({ params }: PageProps<"/c/[slug]">) {
	const categoria = await categoriaPorSlug((await params).slug);
	if (!categoria) notFound();
	const { raiz, atual, ids } = categoria;
	const produtos = await produtosDaLoja({ categorias: ids });

	return (
		<section className="px-(--margem) pt-10">
			<div className="flex flex-col gap-4">
				{atual.id !== raiz.id && (
					<Link
						href={`/c/${raiz.slug}`}
						className="text-small text-suave underline-offset-4 hover:underline"
					>
						{raiz.nome}
					</Link>
				)}
				<h1 className="display entra text-[clamp(3.5rem,14vw,9rem)]">
					{atual.nome}
				</h1>
				{raiz.vitrine && (
					<p className="max-w-[52ch] text-suave">
						Vitrine da loja parceira: escolha o produto e finalize a compra no
						site da marca.
					</p>
				)}
			</div>
			{raiz.filhas.length > 0 && (
				<nav
					aria-label={`Subcategorias de ${raiz.nome}`}
					className="mt-6 mb-8 flex flex-wrap gap-2"
				>
					{[raiz, ...raiz.filhas].map((c) => (
						<Link
							key={c.id}
							href={`/c/${c.slug}`}
							aria-current={c.id === atual.id ? "page" : undefined}
							className="botao min-h-11 border border-linha px-4 text-small font-normal aria-[current=page]:border-tinta aria-[current=page]:bg-tinta aria-[current=page]:text-papel"
						>
							{c.id === raiz.id ? "Tudo" : c.nome}
						</Link>
					))}
				</nav>
			)}
			<div className="mt-8">
				<GradeProdutos
					produtos={produtos}
					vazio="Nenhuma peça nesta categoria ainda. Volte em breve!"
				/>
			</div>
		</section>
	);
}
