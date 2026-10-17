import { describe, expect, it } from "vitest";
import {
	adicionar,
	alterar,
	conciliar,
	detalheVariante,
	LIMITE_POR_ITEM,
	lerSacola,
	mensagemPedido,
	type VarianteConferida,
} from "./sacola";

const variante = (
	id: string,
	estoque: number,
	preco = 1000,
): VarianteConferida => ({
	id,
	nome: `Peça ${id}`,
	slug: id,
	cor: null,
	tamanho: "M",
	preco,
	estoque,
	foto: null,
});

describe("sacola", () => {
	it("soma quantidade da mesma variante e respeita o limite", () => {
		let itens = adicionar([], "a");
		itens = adicionar(itens, "a", 2);
		expect(itens).toEqual([{ varianteId: "a", quantidade: 3 }]);
		expect(adicionar(itens, "a", 50)[0].quantidade).toBe(LIMITE_POR_ITEM);
	});

	it("remove ao zerar a quantidade", () => {
		expect(alterar([{ varianteId: "a", quantidade: 2 }], "a", 0)).toEqual([]);
	});

	it("conciliar ajusta ao estoque, tira esgotadas e calcula o total com o preço atual", () => {
		const r = conciliar(
			[
				{ varianteId: "a", quantidade: 3 },
				{ varianteId: "b", quantidade: 1 },
				{ varianteId: "c", quantidade: 1 },
				{ varianteId: "d", quantidade: 2 },
			],
			[variante("a", 2, 18990), variante("b", 0), variante("d", 5, 5000)],
		);
		expect(r.itens).toEqual([
			{ varianteId: "a", quantidade: 2 },
			{ varianteId: "d", quantidade: 2 },
		]);
		expect(r.total).toBe(2 * 18990 + 2 * 5000);
		expect(r.avisos).toEqual([
			"Peça a: só restam 2 peças.",
			"Peça b esgotou e saiu da sacola.",
			"Uma peça não está mais disponível e saiu da sacola.",
		]);
	});

	it("lê do armazenamento ignorando lixo", () => {
		expect(lerSacola(null)).toEqual([]);
		expect(lerSacola("{quebrado")).toEqual([]);
		expect(
			lerSacola(
				'[{"varianteId":"a","quantidade":2},{"varianteId":1},{"varianteId":"b","quantidade":0}]',
			),
		).toEqual([{ varianteId: "a", quantidade: 2 }]);
	});
});

it("monta a mensagem do pedido com detalhe, subtotal e link", () => {
	const linha = { ...variante("a", 3, 18990), cor: "Azul", quantidade: 2 };
	const texto = mensagemPedido(
		[linha],
		{ tipo: "retirada" },
		37980,
		"https://loja.test",
	);
	expect(texto).toContain("• 2x Peça a (Azul, M): R$ 379,80");
	expect(texto).toContain("https://loja.test/p/a");
	expect(texto).toContain("Retirada na loja: grátis");
	expect(texto).toMatch(/Total: R\$\s379,80$/);
	expect(detalheVariante({ cor: null, tamanho: "G" }, " · ")).toBe("G");
});
