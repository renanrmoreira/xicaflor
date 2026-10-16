import { z } from "zod";
import { centavosDeTexto } from "./dinheiro";

const variante = z.object({
	id: z.uuid().optional(),
	cor: z.string().trim().max(30, "Cor com até 30 letras."),
	tamanho: z.string().trim().max(10, "Tamanho com até 10 letras."),
	preco: z
		.string()
		.transform((t) => centavosDeTexto(t))
		.refine(
			(c): c is number => c !== null && c > 0,
			"Informe um preço maior que zero, como 189,90.",
		),
	estoque: z.coerce
		.number<string>()
		.int("Estoque é um número inteiro.")
		.min(0, "Estoque não pode ser negativo."),
});

export const produtoValido = z
	.object({
		id: z.uuid().optional(),
		nome: z
			.string()
			.trim()
			.min(2, "Nome com pelo menos 2 letras.")
			.max(80, "Nome com até 80 letras."),
		descricao: z.string().trim().max(2000, "Descrição com até 2000 letras."),
		marca: z.string().trim().max(40, "Marca com até 40 letras."),
		categoria_id: z.uuid("Escolha uma categoria."),
		ativo: z.boolean(),
		destaque: z.boolean(),
		variantes: z.array(variante),
	})
	.refine(
		(p) =>
			new Set(
				p.variantes.map(
					(v) => `${v.cor.toLowerCase()}|${v.tamanho.toLowerCase()}`,
				),
			).size === p.variantes.length,
		{
			message: "Há variantes repetidas (mesma cor e tamanho).",
			path: ["variantes"],
		},
	);

export type ProdutoEntrada = z.input<typeof produtoValido>;
