import { expect, it } from "vitest";
import { slug } from "./slug";

it("gera slug sem acento, espaço ou símbolo", () => {
	expect(slug("Calças & Saias")).toBe("calcas-saias");
	expect(slug("  Roupas de Festa! ")).toBe("roupas-de-festa");
	expect(slug("Maiô")).toBe("maio");
});
