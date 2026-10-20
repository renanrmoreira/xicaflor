"use client";

import { useActionState, useState } from "react";
import { Botao } from "@/components/ui/botao";
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
	const [confirmando, setConfirmando] = useState(false);
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
				{cancelavel && !confirmando && (
					<Botao variante="secundario" onClick={() => setConfirmando(true)}>
						Cancelar pedido
					</Botao>
				)}
			</div>
			{confirmando && cancelavel && (
				<form
					action={enviar}
					className="entra flex flex-col gap-3 border-l-4 border-vermelho bg-amarelo/40 p-4"
				>
					<p className="font-semibold">
						Cancelar o pedido e devolver as peças ao estoque?
					</p>
					<input type="hidden" name="status" value="cancelado" />
					<div className="flex flex-wrap gap-3">
						<BotaoEnviar rotuloPendente="Cancelando…">
							Sim, cancelar pedido
						</BotaoEnviar>
						<Botao variante="fantasma" onClick={() => setConfirmando(false)}>
							Voltar
						</Botao>
					</div>
				</form>
			)}
			{estado?.erro && (
				<p role="alert" className="text-small text-vermelho">
					{estado.erro}
				</p>
			)}
		</div>
	);
}
