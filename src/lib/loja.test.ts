import { expect, it } from "vitest";
import { linkWhatsapp, padraoIlike, termoDeBusca } from "./loja";

it("monta o link do WhatsApp com a mensagem codificada", () => {
	expect(linkWhatsapp("Quero o Vestido Ipê — M")).toBe(
		"https://wa.me/5591988008817?text=Quero%20o%20Vestido%20Ip%C3%AA%20%E2%80%94%20M",
	);
});

it("normaliza o termo de busca e ignora termos curtos", () => {
	expect(termoDeBusca("  vestido   longo ")).toBe("vestido longo");
	expect(termoDeBusca("a")).toBeNull();
	expect(termoDeBusca(undefined)).toBeNull();
	expect(termoDeBusca(["blusa", "x"])).toBe("blusa");
});

it("escapa curingas do ilike", () => {
	expect(padraoIlike("50%_off\\")).toBe("%50\\%\\_off\\\\%");
});
