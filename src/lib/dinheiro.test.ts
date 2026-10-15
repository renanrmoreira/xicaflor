import { describe, expect, it } from "vitest";
import { formatarReais } from "./dinheiro";

describe("formatarReais", () => {
	it("formata centavos em reais", () => {
		expect(formatarReais(12990)).toBe("R$ 129,90");
		expect(formatarReais(0)).toBe("R$ 0,00");
	});

	it("rejeita valor fracionado", () => {
		expect(() => formatarReais(10.5)).toThrow();
	});
});
