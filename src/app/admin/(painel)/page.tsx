import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { EM_ANDAMENTO, rotuloStatus } from "@/lib/pedido";
import { resumoVendas } from "@/server/pedidos";

export default async function Page() {
	const resumo = await resumoVendas();
	const vendas = [
		{
			rotulo: "Hoje",
			centavos: resumo.dia_centavos,
			pedidos: resumo.dia_pedidos,
		},
		{
			rotulo: "Este mês",
			centavos: resumo.mes_centavos,
			pedidos: resumo.mes_pedidos,
		},
	];
	return (
		<section className="flex flex-col gap-8">
			<h1 className="display text-head">Painel</h1>
			<dl className="grid gap-4 sm:grid-cols-2">
				{vendas.map(({ rotulo, centavos, pedidos }) => (
					<div
						key={rotulo}
						className="flex flex-col gap-1 border border-linha p-5"
					>
						<dt className="text-small font-semibold text-suave">{rotulo}</dt>
						<dd className="display text-lead">{formatarReais(centavos)}</dd>
						<dd className="text-small text-suave">
							{pedidos} {pedidos === 1 ? "pedido pago" : "pedidos pagos"}
						</dd>
					</div>
				))}
			</dl>
			<div className="flex flex-col gap-3">
				<h2 className="font-semibold">Pedidos em andamento</h2>
				<ul className="flex flex-col divide-y divide-linha border-y border-linha">
					{EM_ANDAMENTO.map((status) => (
						<li key={status} className="flex justify-between gap-4 py-3">
							<span>{rotuloStatus(status)}</span>
							<span className="font-semibold">
								{resumo.por_status[status] ?? 0}
							</span>
						</li>
					))}
				</ul>
				<Link
					href="/admin/pedidos"
					className="text-small underline underline-offset-4"
				>
					Ver pedidos
				</Link>
			</div>
		</section>
	);
}
