export type Resultado = { erro?: string; ok?: boolean } | undefined;

export type EstadoConta =
	| { erro?: string; ok?: boolean; valores?: Record<string, string> }
	| undefined;
