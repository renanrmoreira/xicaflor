import { expect, it } from "vitest";
import { compararTamanhos, ordenarVariantes } from "./tamanhos";

it("ordena letras na ordem de roupa, depois números, depois o resto", () => {
	const tamanhos = ["G", "Único", "38", "PP", "GG", "M", "36", "P", null, "40"];
	expect(tamanhos.toSorted(compararTamanhos)).toEqual([
		"PP",
		"P",
		"M",
		"G",
		"GG",
		"36",
		"38",
		"40",
		null,
		"Único",
	]);
});

it("agrupa por cor e ordena tamanhos dentro de cada cor", () => {
	const v = [
		{ cor: "Preto", tamanho: "G" },
		{ cor: "Azul", tamanho: "M" },
		{ cor: "Preto", tamanho: "P" },
		{ cor: "Azul", tamanho: "P" },
	];
	expect(ordenarVariantes(v).map((x) => `${x.cor} ${x.tamanho}`)).toEqual([
		"Azul P",
		"Azul M",
		"Preto P",
		"Preto G",
	]);
});
