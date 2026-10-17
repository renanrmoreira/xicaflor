export type Resultado = { erro?: string; ok?: boolean } | undefined;

export type EstadoConta =
	| (NonNullable<Resultado> & { valores?: Record<string, string> })
	| undefined;

export type AcaoConta = (
	estado: EstadoConta,
	dados: FormData,
) => Promise<EstadoConta>;
