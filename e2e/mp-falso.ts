import { createServer } from "node:http";

export const PORTA_MP = 3999;

const preferencias = new Map<string, Record<string, unknown>>();
const pagamentos = new Map<string, Record<string, unknown>>();
const emails = new Map<string, Record<string, unknown>>();
let falhasPendentes = 0;

function corpo(
	req: import("node:http").IncomingMessage,
): Promise<Record<string, unknown>> {
	return new Promise((ok) => {
		let dados = "";
		req.on("data", (pedaco) => {
			dados += pedaco;
		});
		req.on("end", () => ok(dados ? JSON.parse(dados) : {}));
	});
}

createServer(async (req, res) => {
	const responder = (status: number, json: unknown) => {
		res.writeHead(status, { "content-type": "application/json" });
		res.end(JSON.stringify(json));
	};
	const url = new URL(req.url ?? "/", "http://localhost");

	if (req.method === "POST" && url.pathname === "/checkout/preferences") {
		if (falhasPendentes > 0) {
			falhasPendentes--;
			return responder(500, { message: "falha simulada" });
		}
		const p = await corpo(req);
		const id = `pref-${p.external_reference}`;
		preferencias.set(String(p.external_reference), {
			...p,
			autorizacao: req.headers.authorization,
		});
		return responder(201, {
			id,
			init_point: (p.back_urls as Record<string, string>).pending,
		});
	}
	if (req.method === "GET" && url.pathname.startsWith("/v1/payments/")) {
		const pagamento = pagamentos.get(url.pathname.split("/").at(-1) ?? "");
		return pagamento
			? responder(200, pagamento)
			: responder(404, { message: "not found" });
	}
	if (req.method === "POST" && url.pathname === "/emails") {
		const chave = String(req.headers["idempotency-key"]);
		emails.set(chave, { ...(await corpo(req)), chave });
		return responder(200, { id: chave });
	}
	if (req.method === "GET" && url.pathname === "/__emails") {
		return responder(200, [...emails.values()]);
	}
	if (req.method === "GET" && url.pathname === "/__preferencia") {
		return responder(
			200,
			preferencias.get(url.searchParams.get("ref") ?? "") ?? null,
		);
	}
	if (req.method === "POST" && url.pathname === "/__pagamento") {
		const p = await corpo(req);
		pagamentos.set(String(p.id), p);
		return responder(200, p);
	}
	if (req.method === "POST" && url.pathname === "/__falhar") {
		falhasPendentes = Number((await corpo(req)).vezes ?? 1);
		return responder(200, { falhasPendentes });
	}
	if (url.pathname === "/") return responder(200, { ok: true });
	responder(404, { message: "rota desconhecida" });
}).listen(PORTA_MP);
