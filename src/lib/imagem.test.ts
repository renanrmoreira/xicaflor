import { expect, it } from "vitest";
import { medidas } from "./imagem";

it("reduz pelo lado maior mantendo a proporção e nunca amplia", () => {
	expect(medidas(4000, 3000, 1600)).toEqual({ largura: 1600, altura: 1200 });
	expect(medidas(3024, 4032, 600)).toEqual({ largura: 450, altura: 600 });
	expect(medidas(800, 600, 1600)).toEqual({ largura: 800, altura: 600 });
});
