"use client";

import { BotaoEnviar } from "@/components/ui/botao-enviar";
import { rotuloStatus } from "@/lib/pedido";

type Props = {
	proximo: string | null;
	cancelavel: boolean;
	mudar: (novo: string) => Promise<void>;
};

export function AcoesPedido({ proximo, cancelavel, mudar }: Props) {
	if (!proximo && !cancelavel) return null;
	return (
		<div className="flex flex-wrap gap-3">
			{proximo && (
				<form action={mudar.bind(null, proximo)}>
					<BotaoEnviar rotuloPendente="Salvando…">
						Marcar como “{rotuloStatus(proximo)}”
					</BotaoEnviar>
				</form>
			)}
			{cancelavel && (
				<form
					action={mudar.bind(null, "cancelado")}
					onSubmit={(e) => {
						if (!confirm("Cancelar o pedido e devolver as peças ao estoque?"))
							e.preventDefault();
					}}
				>
					<BotaoEnviar variante="secundario" rotuloPendente="Cancelando…">
						Cancelar pedido
					</BotaoEnviar>
				</form>
			)}
		</div>
	);
}
