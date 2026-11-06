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
			foto?: string | null;
			estoque?: number | null;
		}[];
	};
};

export function ResumoPedido({ pedido }: Props) {
	return (
		<>
			<ul className="flex flex-col divide-y divide-linha border-y border-linha">
				{pedido.itens.map((i) => (
					<li key={i.id} className="flex items-center gap-4 py-3">
						{i.foto !== undefined &&
							(i.foto ? (
								// biome-ignore lint/performance/noImgElement: miniatura já comprimida no envio
								<img
									src={i.foto}
									alt=""
									width={56}
									height={70}
									loading="lazy"
									className="aspect-4/5 w-14 shrink-0 bg-linha object-cover"
								/>
							) : (
								<span
									aria-hidden
									className="aspect-4/5 w-14 shrink-0 bg-linha"
								/>
							))}
						<span className="flex-1">
							{i.quantidade}× {i.nome_produto}
							<span className="block text-small text-suave">
								{detalheVariante(i, " · ")}
							</span>
							{i.estoque != null && (
								<span
									className={`block text-small ${i.estoque === 0 ? "text-vermelho" : "text-suave"}`}
								>
									{i.estoque === 0
										? "Esgotado no estoque"
										: `Restam ${i.estoque} em estoque`}
								</span>
							)}
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
