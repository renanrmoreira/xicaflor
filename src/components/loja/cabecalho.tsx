import Link from "next/link";
import { BotaoSacola } from "@/components/loja/sacola";
import { Wordmark } from "@/components/ui/marca";
import type { RaizLoja } from "@/lib/loja";

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
				<div className="-mr-3 flex items-center">
					<Link
						href="/busca"
						aria-label="Buscar peças"
						className="botao min-h-11 px-3"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden
						>
							<circle
								cx="10.5"
								cy="10.5"
								r="6.5"
								stroke="currentColor"
								strokeWidth="2"
							/>
							<path
								d="M15.5 15.5 21 21"
								stroke="currentColor"
								strokeWidth="2"
							/>
						</svg>
					</Link>
					<BotaoSacola />
				</div>
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
