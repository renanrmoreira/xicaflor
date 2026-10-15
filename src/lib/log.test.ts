import { expect, it, vi } from "vitest";
import { log } from "./log";

it("escreve uma linha JSON com nível, mensagem e campos", () => {
	const spy = vi.spyOn(console, "error").mockImplementation(() => {});
	log("error", "falhou", { request_id: "abc" });
	const linha = JSON.parse(spy.mock.calls[0][0]);
	expect(linha).toMatchObject({
		nivel: "error",
		mensagem: "falhou",
		request_id: "abc",
	});
	spy.mockRestore();
});
