import { expect, it } from "vitest";
import { gruposDeCategoria } from "./categorias";

const raizes = [
	{
		id: "m",
		nome: "Moda",
		vitrine: false,
		filhas: [{ id: "v", nome: "Vestidos", ativo: false }],
	},
	{
		id: "b",
		nome: "Beleza",
		vitrine: true,
		filhas: [{ id: "q", nome: "Maquiagem", ativo: true }],
	},
];

it("esconde subcategoria desativada e deixa a raiz vazia", () => {
	const [moda, beleza] = gruposDeCategoria(raizes, "");
	expect(moda.opcoes).toEqual([]);
	expect(beleza).toMatchObject({
		rotulo: "Beleza (vitrine)",
		opcoes: [{ id: "q" }],
	});
});

it("mantém a subcategoria atual do produto mesmo desativada", () => {
	expect(gruposDeCategoria(raizes, "v")[0].opcoes).toEqual([
		{ id: "v", nome: "Vestidos", ativo: false },
	]);
});
