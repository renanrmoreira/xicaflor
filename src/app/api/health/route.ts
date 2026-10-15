import * as Sentry from "@sentry/nextjs";
import { log } from "@/lib/log";
import { bancoRespondendo } from "@/server/saude";

export async function GET(request: Request) {
	const requestId = request.headers.get("cf-ray") ?? crypto.randomUUID();
	const inicio = Date.now();
	try {
		if (!(await bancoRespondendo()))
			throw new Error("banco não respondeu ao health check");
		log("info", "health ok", {
			request_id: requestId,
			ms: Date.now() - inicio,
		});
		return Response.json({ status: "ok" });
	} catch (erro) {
		Sentry.captureException(erro);
		log("error", "health falhou", {
			request_id: requestId,
			erro: String(erro),
		});
		return Response.json({ status: "erro" }, { status: 503 });
	}
}
