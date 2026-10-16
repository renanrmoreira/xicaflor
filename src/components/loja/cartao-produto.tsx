import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import type { Cartao } from "@/lib/loja";

function CartaoProduto({
	produto,
	prioridade = false,
}: {
	produto: Cartao;
	prioridade?: boolean;
}) {
	return (
		<Link href={`/p/${produto.slug}`} className="group flex flex-col gap-2">
			<div className="relative aspect-4/5 overflow-hidden bg-linha">
				{produto.capa ? (
					// biome-ignore lint/performance/noImgElement: as fotos já são servidas em dois tamanhos comprimidos
					<img
						src={produto.capa.miniatura}
						srcSet={`${produto.capa.miniatura} 600w, ${produto.capa.grande} 1600w`}
						sizes="(min-width: 768px) 25vw, 50vw"
						alt={produto.capa.alt || produto.nome}
						width={600}
						height={750}
						loading={prioridade ? "eager" : "lazy"}
						fetchPriority={prioridade ? "high" : "auto"}
						decoding="async"
						className="size-full object-cover transition-[scale] duration-(--dur-longa) ease-(--ease-saida) group-hover:scale-[1.03]"
					/>
				) : (
					<span
						aria-hidden
						className="display grid size-full place-items-center text-[2rem] text-suave/40"
					>
						XF
					</span>
				)}
				{produto.esgotado && (
					<span className="absolute top-2 left-2 bg-tinta px-2 py-1 text-small text-papel">
						Esgotado
					</span>
				)}
			</div>
			<div className="flex flex-col">
				{produto.marca && (
					<span className="text-small text-suave">{produto.marca}</span>
				)}
				<span className="leading-snug underline-offset-4 group-hover:underline">
					{produto.nome}
				</span>
				{produto.vitrine ? (
					<span className="text-small text-suave">Ver na loja parceira</span>
				) : (
					produto.preco !== null && (
						<span className="font-semibold">
							{produto.varia && (
								<span className="text-small font-normal text-suave">
									a partir de{" "}
								</span>
							)}
							{formatarReais(produto.preco)}
						</span>
					)
				)}
			</div>
		</Link>
	);
}

export function GradeProdutos({
	produtos,
	vazio,
}: {
	produtos: Cartao[];
	vazio: string;
}) {
	if (!produtos.length) return <p className="py-10 text-suave">{vazio}</p>;
	return (
		<ul className="grid grid-cols-2 gap-x-(--vao) gap-y-8 md:grid-cols-4">
			{produtos.map((p, i) => (
				<li
					key={p.id}
					className="entra"
					style={{ transitionDelay: `${Math.min(i, 8) * 50}ms` }}
				>
					<CartaoProduto produto={p} prioridade={i < 2} />
				</li>
			))}
		</ul>
	);
}
