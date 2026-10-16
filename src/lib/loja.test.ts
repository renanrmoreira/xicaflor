import { expect, it } from "vitest";
import { linkWhatsapp } from "./loja";

it("monta o link do WhatsApp com a mensagem codificada", () => {
	expect(linkWhatsapp("Quero o Vestido Ipê — M")).toBe(
		"https://wa.me/5591988008817?text=Quero%20o%20Vestido%20Ip%C3%AA%20%E2%80%94%20M",
	);
});
