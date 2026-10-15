type Nivel = "info" | "warn" | "error";

export function log(
	nivel: Nivel,
	mensagem: string,
	campos: Record<string, unknown> = {},
) {
	console[nivel](
		JSON.stringify({
			nivel,
			mensagem,
			...campos,
			em: new Date().toISOString(),
		}),
	);
}
