import * as Sentry from "@sentry/nextjs";
import { assinaturaValida } from "@/lib/mercadopago";
import { processarPagamento } from "@/server/mercadopago";

export async function POST(request: Request) {
	const url = new URL(request.url);
	const id = url.searchParams.get("data.id");
	if (url.searchParams.get("type") !== "payment" || !id || !/^\w+$/.test(id))
		return new Response(null, { status: 200 });
	const valida = await assinaturaValida(
		request.headers.get("x-signature"),
		request.headers.get("x-request-id"),
		id,
		process.env.MP_WEBHOOK_SECRET ?? "",
	);
	if (!valida) return new Response(null, { status: 401 });
	try {
		return Response.json({ resultado: await processarPagamento(id) });
	} catch (erro) {
		Sentry.captureException(erro);
		return new Response(null, { status: 500 });
	}
}
