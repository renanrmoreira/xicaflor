import Link from "next/link";
import { Wordmark } from "@/components/ui/marca";
import { linkWhatsapp, type RaizLoja } from "@/lib/loja";

export function Cabecalho({ raizes }: { raizes: RaizLoja[] }) {
	const moda = raizes.find((r) => !r.vitrine);
	return (
		<header className="sticky top-0 z-40 border-b border-linha bg-papel/95 backdrop-blur-sm">
			<div className="flex items-center justify-between px-(--margem) py-3">
				<Link
					href="/"
					aria-label="Xica Flor, página inicial"
					className="text-vermelho"
				>
					<Wordmark className="w-24 md:w-28" />
				</Link>
				<nav
					aria-label="Categorias"
					className="hidden gap-6 font-semibold md:flex"
				>
					{raizes.map((r) => (
						<Link
							key={r.id}
							href={`/c/${r.slug}`}
							className="underline-offset-8 hover:underline"
						>
							{r.nome}
						</Link>
					))}
				</nav>
				<a
					href={linkWhatsapp("Olá! Vim pelo site da Xica Flor.")}
					target="_blank"
					rel="noopener"
					className="botao min-h-11 px-3 text-small underline-offset-4 hover:underline"
				>
					Fale conosco
				</a>
			</div>
			{moda && moda.filhas.length > 0 && (
				<nav
					aria-label="Subcategorias de moda"
					className="flex gap-5 overflow-x-auto px-(--margem) pb-3 text-small whitespace-nowrap [scrollbar-width:none] md:hidden"
				>
					{raizes.map((r) => (
						<Link key={r.id} href={`/c/${r.slug}`} className="font-semibold">
							{r.nome}
						</Link>
					))}
					{moda.filhas.map((f) => (
						<Link key={f.id} href={`/c/${f.slug}`} className="text-suave">
							{f.nome}
						</Link>
					))}
				</nav>
			)}
		</header>
	);
}
