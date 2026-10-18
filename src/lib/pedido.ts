const STATUS = {
	aguardando_pagamento: "Aguardando pagamento",
	pago: "Pago",
	separando: "Separando as peças",
	saiu_para_entrega: "Saiu para entrega",
	entregue: "Entregue",
	pronto_para_retirada: "Pronto para retirar",
	retirado: "Retirado",
	cancelado: "Cancelado",
	expirado: "Reserva expirada",
} as const;

export type Status = keyof typeof STATUS;

export const rotuloStatus = (status: string) =>
	STATUS[status as Status] ?? status;

const FLUXO = {
	entrega: [
		"aguardando_pagamento",
		"pago",
		"separando",
		"saiu_para_entrega",
		"entregue",
	],
	retirada: [
		"aguardando_pagamento",
		"pago",
		"separando",
		"pronto_para_retirada",
		"retirado",
	],
} as const;

export function linhaDoTempo(status: string, modalidade: string) {
	const fluxo: readonly string[] =
		FLUXO[modalidade === "retirada" ? "retirada" : "entrega"];
	const atual = fluxo.indexOf(status);
	if (atual < 0) return [];
	return fluxo.map((s, i) => ({
		status: s,
		rotulo: rotuloStatus(s),
		feito: i <= atual,
	}));
}
