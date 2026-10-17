import { z } from "zod";

export const nome = z.string().trim().min(2, "Informe seu nome.").max(80);

export const telefone = z
	.string()
	.transform((t) => t.replace(/\D/g, ""))
	.refine(
		(t) => t === "" || (t.length >= 10 && t.length <= 13),
		"WhatsApp com DDD, só números.",
	);

export function valoresDoForm<T extends string>(
	dados: FormData,
	chaves: readonly T[],
) {
	return Object.fromEntries(
		chaves.map((c) => [c, String(dados.get(c) ?? "")]),
	) as Record<T, string>;
}
