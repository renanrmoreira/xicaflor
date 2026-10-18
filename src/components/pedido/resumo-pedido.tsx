import { formatarReais } from "@/lib/dinheiro";
import { detalheVariante } from "@/lib/sacola";

type Props = {
	pedido: {
		modalidade: string;
		frete_a_combinar: boolean;
		subtotal_centavos: number;
		frete_centavos: number;
		total_centavos: number | null;
		itens: {
			id: string;
			nome_produto: string;
			cor: string | null;
			tamanho: string | null;
			preco_unitario_centavos: number;
			quantidade: number;
		}[];
	};
};

export function ResumoPedido({ pedido }: Props) {
	return (
		<>
			<ul className="flex flex-col divide-y divide-linha border-y border-linha">
				{pedido.itens.map((i) => (
					<li key={i.id} className="flex justify-between gap-4 py-3">
						<span>
							{i.quantidade}× {i.nome_produto}
							<span className="block text-small text-suave">
								{detalheVariante(i, " · ")}
							</span>
						</span>
						<span className="shrink-0">
							{formatarReais(i.preco_unitario_centavos * i.quantidade)}
						</span>
					</li>
				))}
			</ul>
			<dl className="grid grid-cols-[1fr_auto] gap-y-2 [&_dd]:text-right">
				<dt>Produtos</dt>
				<dd>{formatarReais(pedido.subtotal_centavos)}</dd>
				<dt>
					{pedido.modalidade === "retirada" ? "Retirada na loja" : "Entrega"}
				</dt>
				<dd>
					{pedido.frete_a_combinar
						? "a combinar"
						: pedido.frete_centavos
							? formatarReais(pedido.frete_centavos)
							: "grátis"}
				</dd>
				<dt className="border-t border-linha pt-2 font-semibold">Total</dt>
				<dd className="border-t border-linha pt-2 font-semibold">
					{formatarReais(pedido.total_centavos ?? 0)}
				</dd>
			</dl>
		</>
	);
}
