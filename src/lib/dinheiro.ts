const formatador = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

export function formatarReais(centavos: number): string {
	if (!Number.isInteger(centavos))
		throw new Error(`centavos deve ser inteiro: ${centavos}`);
	return formatador.format(centavos / 100);
}

export function centavosDeTexto(texto: string): number | null {
	const limpo = texto.replace(/[R$\s]/g, "");
	if (!/^\d{1,3}(\.?\d{3})*(,\d{1,2})?$|^\d+([.,]\d{1,2})?$/.test(limpo))
		return null;
	const decimal = /,\d{1,2}$/.test(limpo)
		? limpo.replace(/\./g, "").replace(",", ".")
		: limpo.replace(/,/g, "");
	return Math.round(Number(decimal) * 100);
}

export function textoDeCentavos(centavos: number): string {
	return (centavos / 100).toFixed(2).replace(".", ",");
}
