import { formatarReais } from "./dinheiro";
import { descreverFrete, type Frete } from "./frete";

export type ItemSacola = { varianteId: string; quantidade: number };

export type VarianteConferida = {
	id: string;
	nome: string;
	slug: string;
	cor: string | null;
	tamanho: string | null;
	preco: number;
	estoque: number;
	foto: string | null;
};

export const LIMITE_POR_ITEM = 10;

export function adicionar(
	itens: ItemSacola[],
	varianteId: string,
	quantidade = 1,
): ItemSacola[] {
	const atual = itens.find((i) => i.varianteId === varianteId);
	if (!atual)
		return [
			...itens,
			{ varianteId, quantidade: Math.min(quantidade, LIMITE_POR_ITEM) },
		];
	return alterar(itens, varianteId, atual.quantidade + quantidade);
}

export function alterar(
	itens: ItemSacola[],
	varianteId: string,
	quantidade: number,
): ItemSacola[] {
	if (quantidade < 1) return itens.filter((i) => i.varianteId !== varianteId);
	const limitada = Math.min(quantidade, LIMITE_POR_ITEM);
	return itens.map((i) =>
		i.varianteId === varianteId ? { ...i, quantidade: limitada } : i,
	);
}

export function conciliar(
	itens: ItemSacola[],
	conferidas: VarianteConferida[],
) {
	const avisos: string[] = [];
	const linhas = itens.flatMap((item) => {
		const v = conferidas.find((c) => c.id === item.varianteId);
		if (!v || v.estoque === 0) {
			avisos.push(
				v
					? `${v.nome} esgotou e saiu da sacola.`
					: "Uma peça não está mais disponível e saiu da sacola.",
			);
			return [];
		}
		if (item.quantidade > v.estoque) {
			avisos.push(
				`${v.nome}: só ${v.estoque === 1 ? "resta 1 peça" : `restam ${v.estoque} peças`}.`,
			);
			return [{ ...v, quantidade: v.estoque }];
		}
		return [{ ...v, quantidade: item.quantidade }];
	});
	const total = linhas.reduce((soma, l) => soma + l.preco * l.quantidade, 0);
	return {
		linhas,
		avisos,
		total,
		itens: linhas.map((l) => ({ varianteId: l.id, quantidade: l.quantidade })),
	};
}

export function lerSacola(texto: string | null): ItemSacola[] {
	try {
		const dados: unknown = JSON.parse(texto ?? "[]");
		if (!Array.isArray(dados)) return [];
		return dados.filter(
			(i): i is ItemSacola =>
				typeof i?.varianteId === "string" &&
				Number.isInteger(i?.quantidade) &&
				i.quantidade > 0,
		);
	} catch {
		return [];
	}
}

export function detalheVariante(
	v: { cor: string | null; tamanho: string | null },
	separador = ", ",
) {
	return [v.cor, v.tamanho].filter(Boolean).join(separador);
}

type LinhaPedido = VarianteConferida & { quantidade: number };

export function mensagemPedido(
	linhas: LinhaPedido[],
	frete: Frete,
	total: number,
	site: string,
) {
	return [
		"Olá! Quero fazer este pedido:",
		...linhas.map((l) => {
			const detalhe = detalheVariante(l);
			return `• ${l.quantidade}x ${l.nome}${detalhe ? ` (${detalhe})` : ""}: ${formatarReais(l.preco * l.quantidade)}\n  ${site}/p/${l.slug}`;
		}),
		descreverFrete(frete),
		`Total: ${formatarReais(total)}`,
	].join("\n");
}
