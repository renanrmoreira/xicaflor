import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { siteAtual } from "@/lib/loja";
import { RECUPERACAO } from "@/server/cliente";
import { supabaseServidor } from "@/server/supabase";

const DESTINOS = ["/conta", "/checkout", "/conta/nova-senha"];
const TIPOS: EmailOtpType[] = ["email", "magiclink", "recovery"];

export async function GET(request: Request) {
	const parametros = new URL(request.url).searchParams;
	const volta = parametros.get("volta") ?? "";
	const tipo = parametros.get("type") as EmailOtpType;
	const tokenHash = parametros.get("token_hash");
	const codigo = parametros.get("code");
	const supabase = await supabaseServidor();

	const { error } =
		tokenHash && TIPOS.includes(tipo)
			? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
			: codigo
				? await supabase.auth.exchangeCodeForSession(codigo)
				: { error: true };
	if (error)
		return NextResponse.redirect(`${siteAtual()}/entrar?link=expirado`);

	const recuperacao = tipo === "recovery";
	const resposta = NextResponse.redirect(
		`${siteAtual()}${recuperacao ? "/conta/nova-senha" : DESTINOS.includes(volta) ? volta : "/conta"}`,
	);
	if (recuperacao)
		resposta.cookies.set(RECUPERACAO, "1", {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: 15 * 60,
			path: "/",
		});
	return resposta;
}
