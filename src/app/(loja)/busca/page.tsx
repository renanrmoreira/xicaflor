import type { Metadata } from "next";
import Link from "next/link";
import { CampoBusca } from "@/components/loja/campo-busca";
import { GradeProdutos } from "@/components/loja/cartao-produto";
import { termoDeBusca } from "@/lib/loja";
import { categoriasDaLoja, produtosDaLoja } from "@/server/loja";

export const metadata: Metadata = {
	title: "Buscar — Xica Flor",
	robots: { index: false },
};

export default async function Page({ searchParams }: PageProps<"/busca">) {
	const termo = termoDeBusca((await searchParams).q);
	const [raizes, produtos] = await Promise.all([
		categoriasDaLoja(),
		termo ? produtosDaLoja({ busca: termo, limite: 24 }) : [],
	]);
	const sugestoes = raizes.flatMap((r) => (r.filhas.length ? r.filhas : [r]));

	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-8">
			<CampoBusca inicial={termo ?? ""} />
			{termo && produtos.length > 0 && (
				<>
					<p aria-live="polite" className="text-small text-suave">
						{produtos.length === 1 ? "1 peça" : `${produtos.length} peças`} para
						“{termo}”
					</p>
					<GradeProdutos produtos={produtos} vazio="" />
				</>
			)}
			{(!termo || produtos.length === 0) && (
				<div className="flex flex-col gap-4">
					<p aria-live="polite" className={termo ? "text-lead" : "text-suave"}>
						{termo
							? `Nada encontrado para “${termo}”.`
							: "Digite pelo menos 2 letras, ou navegue pelas categorias:"}
					</p>
					{termo && (
						<p className="text-suave">Que tal navegar pelas categorias?</p>
					)}
					<ul className="flex flex-wrap gap-2">
						{sugestoes.map((c) => (
							<li key={c.id}>
								<Link
									href={`/c/${c.slug}`}
									className="botao min-h-11 border border-linha px-4 text-small font-normal hover:border-tinta"
								>
									{c.nome}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
