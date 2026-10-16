import "server-only";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function renovarSessao(request: NextRequest) {
	let resposta = NextResponse.next({ request });
	const supabase = createServerClient(
		process.env.SUPABASE_URL ?? "",
		process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			cookies: {
				getAll: () => request.cookies.getAll(),
				setAll: (lista) => {
					for (const { name, value } of lista) request.cookies.set(name, value);
					resposta = NextResponse.next({ request });
					for (const { name, value, options } of lista)
						resposta.cookies.set(name, value, options);
				},
			},
		},
	);
	await supabase.auth.getUser();
	return resposta;
}
