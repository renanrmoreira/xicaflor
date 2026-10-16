const LETRAS = ["PP", "P", "M", "G", "GG", "XG", "XGG", "EG", "EGG", "EXG"];

function peso(tamanho: string | null): [number, number, string] {
	const t = (tamanho ?? "").trim().toUpperCase();
	const letra = LETRAS.indexOf(t);
	if (letra >= 0) return [0, letra, t];
	if (/^\d+([.,]\d+)?$/.test(t)) return [1, Number(t.replace(",", ".")), t];
	return [2, 0, t];
}

export function compararTamanhos(a: string | null, b: string | null) {
	const [ga, na, ta] = peso(a);
	const [gb, nb, tb] = peso(b);
	return ga - gb || na - nb || ta.localeCompare(tb, "pt-BR");
}

export function ordenarVariantes<
	T extends { cor: string | null; tamanho: string | null },
>(variantes: T[]): T[] {
	return variantes.toSorted(
		(a, b) =>
			(a.cor ?? "").localeCompare(b.cor ?? "", "pt-BR") ||
			compararTamanhos(a.tamanho, b.tamanho),
	);
}
