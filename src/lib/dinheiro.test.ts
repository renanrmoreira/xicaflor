import { describe, expect, it } from "vitest";
import { centavosDeTexto, formatarReais, textoDeCentavos } from "./dinheiro";

describe("formatarReais", () => {
	it("formata centavos em reais", () => {
		expect(formatarReais(12990)).toBe("R$ 129,90");
		expect(formatarReais(0)).toBe("R$ 0,00");
	});

	it("rejeita valor fracionado", () => {
		expect(() => formatarReais(10.5)).toThrow();
	});
});

describe("centavosDeTexto", () => {
	it("aceita os formatos que a dona da loja digita", () => {
		expect(centavosDeTexto("189,90")).toBe(18990);
		expect(centavosDeTexto("R$ 1.299,90")).toBe(129990);
		expect(centavosDeTexto("189")).toBe(18900);
		expect(centavosDeTexto("189.9")).toBe(18990);
		expect(centavosDeTexto("0,5")).toBe(50);
	});

	it("rejeita texto que não é preço", () => {
		expect(centavosDeTexto("")).toBeNull();
		expect(centavosDeTexto("abc")).toBeNull();
		expect(centavosDeTexto("12,345")).toBeNull();
		expect(centavosDeTexto("-10")).toBeNull();
	});

	it("faz ida e volta com textoDeCentavos", () => {
		expect(centavosDeTexto(textoDeCentavos(129990))).toBe(129990);
	});
});
