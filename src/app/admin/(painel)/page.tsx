import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { EM_ANDAMENTO, rotuloStatus } from "@/lib/pedido";
import { detalheVariante } from "@/lib/sacola";
import { painelDoAdmin, pedidosDoAdmin, resumoVendas } from "@/server/pedidos";

function Miniatura({ foto }: { foto: string | null | undefined }) {
	return foto ? (
		// biome-ignore lint/performance/noImgElement: miniatura já comprimida no envio
		<img
			src={foto}
			alt=""
			width={48}
			height={60}
			loading="lazy"
			className="aspect-4/5 w-12 shrink-0 bg-linha object-cover"
		/>
	) : (
		<span aria-hidden className="aspect-4/5 w-12 shrink-0 bg-linha" />
	);
}

export default async function Page() {
	const [resumo, painel, ultimos] = await Promise.all([
		resumoVendas(),
		painelDoAdmin(),
		pedidosDoAdmin(
			[...EM_ANDAMENTO, "entregue", "retirado", "cancelado", "expirado"],
			5,
		),
	]);
	const paraPreparar = EM_ANDAMENTO.filter(
		(s) => s !== "aguardando_pagamento",
	).reduce((t, s) => t + (resumo.por_status[s] ?? 0), 0);
	const cartoes = [
		{
			rotulo: "Hoje",
			valor: formatarReais(resumo.dia_centavos),
			detalhe: `${resumo.dia_pedidos} ${resumo.dia_pedidos === 1 ? "pedido pago" : "pedidos pagos"}`,
		},
		{
			rotulo: "Este mês",
			valor: formatarReais(resumo.mes_centavos),
			detalhe: `${resumo.mes_pedidos} ${resumo.mes_pedidos === 1 ? "pedido pago" : "pedidos pagos"}`,
		},
		{
			rotulo: "Ticket médio do mês",
			valor: formatarReais(
				resumo.mes_pedidos
					? Math.round(resumo.mes_centavos / resumo.mes_pedidos)
					: 0,
			),
			detalhe: "valor médio por pedido",
		},
		{
			rotulo: "Para preparar",
			valor: String(paraPreparar),
			detalhe: `${resumo.por_status.aguardando_pagamento ?? 0} aguardando pagamento`,
		},
	];
	const maior = Math.max(1, ...painel.semana.map((d) => d.centavos));

	return (
		<section className="flex flex-col gap-10">
			<h1 className="display text-head">Painel</h1>

			<dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{cartoes.map((c) => (
					<div
						key={c.rotulo}
						className="flex flex-col gap-1 border border-linha p-5"
					>
						<dt className="text-small font-semibold text-suave">{c.rotulo}</dt>
						<dd className="display text-lead">{c.valor}</dd>
						<dd className="text-small text-suave">{c.detalhe}</dd>
					</div>
				))}
			</dl>

			<div className="flex flex-col gap-4">
				<h2 className="font-semibold">Vendas dos últimos 7 dias</h2>
				<ol className="flex h-48 items-end gap-2 border-b border-linha">
					{painel.semana.map((d) => (
						<li
							key={d.dia}
							className="flex h-full flex-1 flex-col items-center justify-end gap-1"
						>
							<span className="text-[0.7rem] text-suave tabular-nums">
								{d.centavos ? formatarReais(d.centavos) : ""}
							</span>
							<span
								className="w-full max-w-16 bg-vermelho"
								style={{ height: `${(d.centavos / maior) * 100}%` }}
								title={`${d.dia}: ${formatarReais(d.centavos)}`}
							/>
						</li>
					))}
				</ol>
				<ol
					aria-hidden
					className="flex gap-2 text-center text-small text-suave"
				>
					{painel.semana.map((d) => (
						<li key={d.dia} className="flex-1">
							{d.dia}
						</li>
					))}
				</ol>
			</div>

			<div className="grid gap-10 lg:grid-cols-2">
				<div className="flex flex-col gap-3">
					<div className="flex items-baseline justify-between">
						<h2 className="font-semibold">Últimos pedidos</h2>
						<Link
							href="/admin/pedidos"
							className="text-small underline underline-offset-4"
						>
							Ver todos
						</Link>
					</div>
					{ultimos.length === 0 ? (
						<p className="text-suave">Nenhum pedido ainda.</p>
					) : (
						<ul className="flex flex-col divide-y divide-linha border-y border-linha">
							{ultimos.map((p) => (
								<li key={p.id}>
									<Link
										href={`/admin/pedidos/${p.id}`}
										className="flex items-center gap-3 py-3"
									>
										<Miniatura foto={p.itens[0]?.foto} />
										<span className="min-w-0 flex-1">
											Nº {p.numero} · {p.cliente?.nome ?? "Cliente"}
											<span className="block truncate text-small text-suave">
												{rotuloStatus(p.status)} · {p.itens[0]?.nome_produto}
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
				</div>

				<div className="flex flex-col gap-3">
					<h2 className="font-semibold">Estoque acabando</h2>
					{painel.estoqueBaixo.length === 0 ? (
						<p className="text-suave">Nenhuma peça com estoque baixo.</p>
					) : (
						<ul className="flex flex-col divide-y divide-linha border-y border-linha">
							{painel.estoqueBaixo.map((v) => (
								<li key={v.id}>
									<Link
										href={`/admin/produtos/${v.produto.id}`}
										className="flex items-center gap-3 py-3"
									>
										<Miniatura foto={v.foto} />
										<span className="min-w-0 flex-1">
											{v.produto.nome}
											<span className="block text-small text-suave">
												{detalheVariante(v, " · ")}
											</span>
										</span>
										<span
											className={`shrink-0 text-small font-semibold ${v.estoque === 0 ? "text-vermelho" : ""}`}
										>
											{v.estoque === 0 ? "Esgotado" : `${v.estoque} em estoque`}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<h2 className="font-semibold">Mais vendidos (30 dias)</h2>
				{painel.maisVendidos.length === 0 ? (
					<p className="text-suave">Ainda sem vendas no período.</p>
				) : (
					<ol className="flex flex-col divide-y divide-linha border-y border-linha">
						{painel.maisVendidos.map((m, i) => (
							<li key={m.nome} className="flex justify-between gap-4 py-3">
								<span>
									{i + 1}. {m.nome}
								</span>
								<span className="font-semibold">
									{m.quantidade} {m.quantidade === 1 ? "peça" : "peças"}
								</span>
							</li>
						))}
					</ol>
				)}
			</div>
		</section>
	);
}
