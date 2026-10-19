import { formatarReais } from "./dinheiro";

export type Zona = {
	nome: string;
	cep_inicio: string;
	cep_fim: string;
	preco_centavos: number | null;
};

export type Frete =
	| { tipo: "retirada" }
	| { tipo: "entrega"; zona: string; preco: number }
	| { tipo: "a_combinar"; zona: string | null };

export function limparCep(texto: string): string | null {
	const digitos = texto.replace(/\D/g, "");
	return digitos.length === 8 ? digitos : null;
}

export function formatarCep(cep: string): string {
	return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

const faixa = (z: Zona) => Number(z.cep_fim) - Number(z.cep_inicio);

export function calcularFrete(cep: string, zonas: Zona[]): Frete {
	const zona = zonas
		.filter((z) => z.cep_inicio <= cep && cep <= z.cep_fim)
		.toSorted((a, b) => faixa(a) - faixa(b))[0];
	if (!zona || zona.preco_centavos === null)
		return { tipo: "a_combinar", zona: zona?.nome ?? null };
	return { tipo: "entrega", zona: zona.nome, preco: zona.preco_centavos };
}

export function descreverFrete(frete: Frete): string {
	if (frete.tipo === "retirada") return "Retirada na loja: grátis";
	if (frete.tipo === "a_combinar")
		return frete.zona
			? `Frete pelo valor do Moto Uber, combinado no WhatsApp (${frete.zona})`
			: "Frete a combinar pelo WhatsApp";
	return frete.preco === 0
		? `Entrega grátis (${frete.zona})`
		: `Entrega (${frete.zona}): ${formatarReais(frete.preco)}`;
}
