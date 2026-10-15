const formatador = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

/** Dinheiro trafega sempre em centavos inteiros; formatar só na borda. */
export function formatarReais(centavos: number): string {
	if (!Number.isInteger(centavos))
		throw new Error(`centavos deve ser inteiro: ${centavos}`);
	return formatador.format(centavos / 100);
}
