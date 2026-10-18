import type { Metadata } from "next";
import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { rotuloStatus } from "@/lib/pedido";
import { pedidosDoAdmin } from "@/server/pedidos";

export const metadata: Metadata = { title: "Pedidos — Admin Xica Flor" };

const FILTROS = {
	abertos: {
		rotulo: "Para preparar",
		status: ["pago", "separando", "saiu_para_entrega", "pronto_para_retirada"],
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
				<ul className="flex flex-col divide-y divide-linha border-y border-linha">
					{pedidos.map((p) => (
						<li key={p.id}>
							<Link
								href={`/admin/pedidos/${p.id}`}
								className="flex min-h-11 items-center justify-between gap-4 py-3"
							>
								<span>
									Pedido nº {p.numero} · {p.cliente?.nome ?? "Cliente"}
									<span className="block text-small text-suave">
										{rotuloStatus(p.status)} ·{" "}
										{p.modalidade === "retirada" ? "Retirada" : "Entrega"} ·{" "}
										{new Date(p.criado_em).toLocaleDateString("pt-BR", {
											timeZone: "America/Belem",
										})}
									</span>
								</span>
								<span className="shrink-0">
									{formatarReais(p.total_centavos ?? 0)}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
