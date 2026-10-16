import { describe, expect, it } from "vitest";
import { produtoValido } from "./produto";

const base = {
	nome: "Vestido Ipê",
	descricao: "",
	marca: "",
	categoria_id: "3f1c2b6e-8a3d-4c2e-9b1a-2d4e6f8a0b1c",
	ativo: true,
	destaque: false,
	variantes: [{ cor: "Azul", tamanho: "M", preco: "189,90", estoque: "3" }],
};

describe("produtoValido", () => {
	it("converte preço e estoque digitados", () => {
		const r = produtoValido.parse(base);
		expect(r.variantes[0]).toMatchObject({ preco: 18990, estoque: 3 });
	});

	it("rejeita preço zero, estoque negativo e variantes repetidas", () => {
		const erros = (v: object[]) =>
			produtoValido
				.safeParse({ ...base, variantes: v })
				.error?.issues.map((i) => i.message) ?? [];
		expect(
			erros([{ cor: "", tamanho: "M", preco: "0", estoque: "1" }]),
		).toContain("Informe um preço maior que zero, como 189,90.");
		expect(
			erros([{ cor: "", tamanho: "M", preco: "10", estoque: "-1" }]),
		).toContain("Estoque não pode ser negativo.");
		expect(
			erros([
				{ cor: "Azul", tamanho: "M", preco: "10", estoque: "1" },
				{ cor: "azul", tamanho: "m", preco: "12", estoque: "1" },
			]),
		).toContain("Há variantes repetidas (mesma cor e tamanho).");
	});
});
