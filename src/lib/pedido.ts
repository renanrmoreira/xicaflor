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
