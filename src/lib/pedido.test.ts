import { expect, it } from "vitest";
import { cancelavel, linhaDoTempo, proximoStatus } from "./pedido";

it("marca as etapas até o status atual no fluxo da modalidade", () => {
	expect(
		linhaDoTempo("separando", "retirada").map((e) => [e.rotulo, e.feito]),
	).toEqual([
		["Aguardando pagamento", true],
		["Pago", true],
		["Separando as peças", true],
		["Pronto para retirar", false],
		["Retirado", false],
	]);
});

it("não mostra linha do tempo para pedido cancelado ou expirado", () => {
	expect(linhaDoTempo("cancelado", "entrega")).toEqual([]);
	expect(linhaDoTempo("expirado", "retirada")).toEqual([]);
});

it("próximo status segue o fluxo da modalidade e só depois do pagamento", () => {
	expect(proximoStatus("aguardando_pagamento", "entrega")).toBeNull();
	expect(proximoStatus("pago", "entrega")).toBe("separando");
	expect(proximoStatus("separando", "entrega")).toBe("saiu_para_entrega");
	expect(proximoStatus("separando", "retirada")).toBe("pronto_para_retirada");
	expect(proximoStatus("entregue", "entrega")).toBeNull();
	expect(proximoStatus("cancelado", "retirada")).toBeNull();
});

it("só cancela pedido que ainda não saiu nem foi concluído", () => {
	expect(cancelavel("pago")).toBe(true);
	expect(cancelavel("saiu_para_entrega")).toBe(false);
	expect(cancelavel("entregue")).toBe(false);
});
