"use client";

import { Botao } from "@/components/ui/botao";

export default function Erro({ reset }: { reset: () => void }) {
	return (
		<section role="alert" className="entra flex flex-col items-start gap-4">
			<h1 className="display text-head">Algo deu errado</h1>
			<p className="text-suave">
				Não conseguimos carregar esta tela. O erro já foi registrado.
			</p>
			<Botao onClick={reset}>Tentar de novo</Botao>
		</section>
	);
}
