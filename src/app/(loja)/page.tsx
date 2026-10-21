import Link from "next/link";
import type { CSSProperties } from "react";
import { GradeProdutos } from "@/components/loja/cartao-produto";
import { classeBotao } from "@/components/ui/botao";
import { SLOGAN } from "@/lib/loja";
import { categoriasDaLoja, produtosDaLoja } from "@/server/loja";

function Monumento({ texto }: { texto: string }) {
	return (
		<h1
			aria-label={texto}
			className="display -mb-[0.1em] text-[clamp(4.5rem,23vw,22rem)] leading-[0.82] whitespace-nowrap text-bordo"
		>
			{[...texto].map((letra, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: letras fixas de um texto que não muda
					key={i}
					aria-hidden
					className="letra"
					style={{ "--i": i } as CSSProperties}
				>
					{letra === " " ? " " : letra}
				</span>
			))}
		</h1>
	);
}

export const revalidate = 3600;

export default async function Home() {
	const [raizes, destaques, novidades] = await Promise.all([
		categoriasDaLoja(),
		produtosDaLoja({ destaque: true, limite: 4 }),
		produtosDaLoja({ limite: 8 }),
	]);
	const moda = raizes.find((r) => !r.vitrine);
	const beleza = raizes.find((r) => r.vitrine);

	return (
		<>
			<section className="flex min-h-[46svh] flex-col md:min-h-[56svh] justify-between overflow-hidden bg-amarelo px-(--margem) pt-8">
				<div className="flex items-start justify-between gap-6">
					<p className="max-w-[22ch] text-lead leading-tight text-bordo">
						{SLOGAN}
					</p>
					<Link href="#novidades" className={`${classeBotao()} shrink-0`}>
						Ver novidades
					</Link>
				</div>
				<Monumento texto="Xica Flor" />
			</section>

			{destaques.length > 0 && (
				<section className="px-(--margem) pt-16">
					<h2 className="display mb-8 text-head">Destaques</h2>
					<GradeProdutos produtos={destaques} vazio="" />
				</section>
			)}

			<section id="novidades" className="scroll-mt-24 px-(--margem) pt-16">
				<h2 className="display mb-8 text-head">Novidades</h2>
				<GradeProdutos
					produtos={novidades}
					vazio="As primeiras peças chegam em breve."
				/>
			</section>

			{moda && moda.filhas.length > 0 && (
				<section className="px-(--margem) pt-20">
					<h2 className="sr-only">Categorias de moda</h2>
					<ul className="border-t border-linha">
						{moda.filhas.map((f) => (
							<li key={f.id} className="border-b border-linha">
								<Link
									href={`/c/${f.slug}`}
									className="display flex items-baseline justify-between py-3 text-[clamp(2.5rem,9vw,6rem)] transition-colors duration-(--dur-toque) hover:text-vermelho"
								>
									{f.nome}
									<span aria-hidden className="text-[0.5em]">
										→
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}

			{beleza && (
				<section className="mx-(--margem) mt-20 flex flex-col gap-4 bg-vermelho p-6 text-papel md:p-10">
					<h2 className="display text-head">{beleza.nome}</h2>
					<p className="max-w-[48ch]">
						Maquiagem, skincare e perfumaria O.Lab e Rinode, com a curadoria da
						Xica Flor.
					</p>
					<Link
						href={`/c/${beleza.slug}`}
						className="botao self-start bg-papel text-vermelho hover:bg-amarelo"
					>
						Ver vitrine de beleza
					</Link>
				</section>
			)}
		</>
	);
}
