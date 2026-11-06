import type { Metadata } from "next";
import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { EM_ANDAMENTO, rotuloStatus } from "@/lib/pedido";
import { pedidosDoAdmin } from "@/server/pedidos";

export const metadata: Metadata = { title: "Pedidos — Admin Xica Flor" };

const FILTROS = {
	abertos: {
		rotulo: "Para preparar",
		status: EM_ANDAMENTO.filter((s) => s !== "aguardando_pagamento"),
	},
	aguardando: {
		rotulo: "Aguardando pagamento",
		status: ["aguardando_pagamento"],
	},
	concluidos: { rotulo: "Concluídos", status: ["entregue", "retirado"] },
	cancelados: { rotulo: "Cancelados", status: ["cancelado", "expirado"] },
};

type Filtro = keyof typeof FILTROS;

export default async function Page({
	searchParams,
}: PageProps<"/admin/pedidos">) {
	const { filtro: bruto } = await searchParams;
	const filtro: Filtro =
		typeof bruto === "string" && bruto in FILTROS
			? (bruto as Filtro)
			: "abertos";
	const pedidos = await pedidosDoAdmin(FILTROS[filtro].status);
	return (
		<>
			<h1 className="display mb-6 text-head">Pedidos</h1>
			<nav aria-label="Filtrar pedidos" className="mb-6 flex flex-wrap gap-2">
				{Object.entries(FILTROS).map(([chave, f]) => (
					<Link
						key={chave}
						href={`/admin/pedidos?filtro=${chave}`}
						aria-current={chave === filtro ? "page" : undefined}
						className="flex min-h-11 items-center rounded-full border border-linha px-4 text-small font-semibold aria-[current=page]:border-tinta aria-[current=page]:bg-tinta aria-[current=page]:text-papel"
					>
						{f.rotulo}
					</Link>
				))}
			</nav>
			{pedidos.length === 0 ? (
				<p className="text-suave">Nenhum pedido aqui.</p>
			) : (
				<ul className="grid gap-4 lg:grid-cols-2">
					{pedidos.map((p) => {
						const [primeiro, ...resto] = p.itens;
						const pecas = p.itens.reduce((t, i) => t + i.quantidade, 0);
						return (
							<li key={p.id}>
								<Link
									href={`/admin/pedidos/${p.id}`}
									className="flex h-full gap-4 border border-linha p-4 transition-colors hover:border-tinta"
								>
									{primeiro?.foto ? (
										// biome-ignore lint/performance/noImgElement: miniatura já comprimida no envio
										<img
											src={primeiro.foto}
											alt=""
											width={72}
											height={90}
											loading="lazy"
											className="aspect-4/5 w-18 shrink-0 bg-linha object-cover"
										/>
									) : (
										<span
											aria-hidden
											className="aspect-4/5 w-18 shrink-0 bg-linha"
										/>
									)}
									<span className="flex min-w-0 flex-1 flex-col gap-1">
										<span className="flex items-baseline justify-between gap-3">
											<span className="font-semibold">
												Pedido nº {p.numero}
											</span>
											<span className="shrink-0 font-semibold">
												{formatarReais(p.total_centavos ?? 0)}
											</span>
										</span>
										<span>{p.cliente?.nome ?? "Cliente"}</span>
										{primeiro && (
											<span className="text-small text-suave">
												{primeiro.quantidade}× {primeiro.nome_produto}
												{resto.length > 0 &&
													` + ${resto.length} ${resto.length === 1 ? "item" : "itens"}`}
												{" · "}
												{pecas} {pecas === 1 ? "peça" : "peças"}
											</span>
										)}
										<span className="text-small text-suave">
											{rotuloStatus(p.status)} ·{" "}
											{p.modalidade === "retirada" ? "Retirada" : "Entrega"} ·{" "}
											{new Date(p.criado_em).toLocaleString("pt-BR", {
												timeZone: "America/Belem",
												dateStyle: "short",
												timeStyle: "short",
											})}
										</span>
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}
