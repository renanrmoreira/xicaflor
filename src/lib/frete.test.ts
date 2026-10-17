import { describe, expect, it } from "vitest";
import {
	calcularFrete,
	descreverFrete,
	formatarCep,
	limparCep,
	type Zona,
} from "./frete";

const zonas: Zona[] = [
	{
		nome: "Belém",
		cep_inicio: "66000000",
		cep_fim: "66999999",
		preco_centavos: 0,
	},
	{
		nome: "Mosqueiro",
		cep_inicio: "66910000",
		cep_fim: "66920999",
		preco_centavos: null,
	},
	{
		nome: "Outeiro",
		cep_inicio: "66840000",
		cep_fim: "66849999",
		preco_centavos: null,
	},
	{
		nome: "Ananindeua",
		cep_inicio: "67000000",
		cep_fim: "67199999",
		preco_centavos: 1500,
	},
];

describe("frete", () => {
	it("Belém é grátis, Mosqueiro e Outeiro a combinar, fora das zonas a combinar", () => {
		expect(calcularFrete("66060000", zonas)).toEqual({
			tipo: "entrega",
			zona: "Belém",
			preco: 0,
		});
		expect(calcularFrete("66910010", zonas)).toEqual({
			tipo: "a_combinar",
			zona: "Mosqueiro",
		});
		expect(calcularFrete("66845020", zonas)).toEqual({
			tipo: "a_combinar",
			zona: "Outeiro",
		});
		expect(calcularFrete("01310100", zonas)).toEqual({
			tipo: "a_combinar",
			zona: null,
		});
	});

	it("cobra o preço da zona e vence a faixa mais estreita", () => {
		expect(calcularFrete("67030000", zonas)).toEqual({
			tipo: "entrega",
			zona: "Ananindeua",
			preco: 1500,
		});
		expect(descreverFrete(calcularFrete("67030000", zonas))).toBe(
			"Entrega (Ananindeua): R$ 15,00",
		);
	});

	it("aceita CEP com ou sem máscara", () => {
		expect(limparCep("66.060-000")).toBe("66060000");
		expect(limparCep("6606")).toBeNull();
		expect(formatarCep("66060000")).toBe("66060-000");
	});
});
