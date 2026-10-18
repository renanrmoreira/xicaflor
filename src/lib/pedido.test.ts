import { expect, it } from "vitest";
import { linhaDoTempo } from "./pedido";

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
