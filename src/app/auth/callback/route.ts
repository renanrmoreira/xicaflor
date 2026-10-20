import { NextResponse } from "next/server";
import { supabaseServidor } from "@/server/supabase";

const DESTINOS = ["/conta", "/checkout", "/conta/nova-senha"];

export async function GET(request: Request) {
	const url = new URL(request.url);
	const codigo = url.searchParams.get("code");
	const volta = url.searchParams.get("volta") ?? "";
	const destino = DESTINOS.includes(volta) ? volta : "/conta";
	if (codigo) {
		const { error } = await (
			await supabaseServidor()
		).auth.exchangeCodeForSession(codigo);
		if (!error) return NextResponse.redirect(new URL(destino, url.origin));
	}
	return NextResponse.redirect(new URL("/entrar?link=expirado", url.origin));
}
