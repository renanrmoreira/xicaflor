"use client";

import { useActionState } from "react";
import { BotaoEnviar } from "@/components/ui/botao-enviar";
import { rotuloStatus } from "@/lib/pedido";
import type { Resultado } from "@/lib/resultado";

type Props = {
	proximo: string | null;
	cancelavel: boolean;
	mudar: (estado: Resultado, dados: FormData) => Promise<Resultado>;
};

export function AcoesPedido({ proximo, cancelavel, mudar }: Props) {
	const [estado, enviar] = useActionState(mudar, undefined);
	if (!proximo && !cancelavel) return null;
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap gap-3">
				{proximo && (
					<form action={enviar}>
						<input type="hidden" name="status" value={proximo} />
						<BotaoEnviar rotuloPendente="Salvando…">
							Marcar como “{rotuloStatus(proximo)}”
						</BotaoEnviar>
					</form>
				)}
				{cancelavel && (
					<form
						action={enviar}
						onSubmit={(e) => {
							if (!confirm("Cancelar o pedido e devolver as peças ao estoque?"))
								e.preventDefault();
						}}
					>
						<input type="hidden" name="status" value="cancelado" />
						<BotaoEnviar variante="secundario" rotuloPendente="Cancelando…">
							Cancelar pedido
						</BotaoEnviar>
					</form>
				)}
			</div>
			{estado?.erro && (
				<p role="alert" className="text-small text-vermelho">
					{estado.erro}
				</p>
			)}
		</div>
	);
}
